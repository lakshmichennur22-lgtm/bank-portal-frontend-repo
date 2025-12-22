# -----------------------
# LOCALS
# -----------------------
locals {
  name_prefix = "${var.project}-${var.application}-${var.environment}-${var.location_short}"
  rg_name     = "${local.name_prefix}-rg"
  asw_name    = "${local.name_prefix}-asw"

  tags = {
    project     = var.project
    application = var.application
    environment = var.environment
    location    = var.location
    blockcode   = var.blockcode
  }
}

data "azurerm_client_config" "current" {}

data "azurerm_container_registry" "example" {
  name                = var.acr_name
  resource_group_name = var.acr_resource_group_name
}

# ----------------------
# RESOURCE GROUP
# ----------------------
resource "azurerm_resource_group" "main" {
  name     = local.rg_name
  location = var.location
  tags     = local.tags
}

# ----------------------
# Azure Static Web App - Frontend
# ----------------------
resource "azurerm_static_web_app" "frontend" {
  name                = local.asw_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

# -----------------------
# Monitoring - Diagnostic Settings
# -----------------------
resource "azurerm_log_analytics_workspace" "log" {
  name                = "${local.name_prefix}-log"
  location            = var.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# ----------------------
# Azure API Management
# ----------------------
resource "azurerm_api_management" "apim" {
  name                = "${local.name_prefix}-apim"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  publisher_name      = "NetuBank"
  publisher_email     = "admin@netubank.com"
  sku_name            = "Developer_1"
  tags                = local.tags
}


# Azure Container Apps Environment
resource "azurerm_container_app_environment" "env" {
  name                       = "${local.name_prefix}-env"
  location                   = var.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.log.id

}
resource "null_resource" "wait_for_env" {
  provisioner "local-exec" {
    command = "echo 'Waiting for Container App Environment...' && sleep 180"
  }

  depends_on = [azurerm_container_app_environment.env]
}


# Container App
resource "azurerm_container_app" "main" {
  name                         = local.name_prefix
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    container {
      name   = "financial-calculator"
      image  = "${data.azurerm_container_registry.example.login_server}/financial-calculator:508"
      cpu    = 1
      memory = "2Gi"
    }
  }
  ingress {
    external_enabled = true
    target_port      = 8080
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  identity {
    type = "SystemAssigned"
  }

  registry {
    server               = data.azurerm_container_registry.example.login_server
    username             = data.azurerm_container_registry.example.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.acr_password
  }
  depends_on = [null_resource.wait_for_env]

}

resource "azurerm_role_assignment" "acr_pull" {
  principal_id         = azurerm_container_app.main.identity[0].principal_id
  role_definition_name = "AcrPull"
  scope                = data.azurerm_container_registry.example.id

  depends_on = [azurerm_container_app.main]
}

resource "null_resource" "wait_for_container_app" {
  provisioner "local-exec" {
    command = "sleep 60" # or curl to ensure container is live
  }

  depends_on = [azurerm_container_app.main]
}

resource "azurerm_api_management_api" "backend_api" {
  name                = "${local.name_prefix}-api"
  resource_group_name = azurerm_resource_group.main.name
  api_management_name = azurerm_api_management.apim.name
  revision            = "1"
  display_name        = "NetuBank API"
  path                = "calculator"
  protocols           = ["https"]
  import {
    content_format = "openapi"
    content_value  = file("${path.module}/swagger.yaml")
  }
  service_url = "https://${azurerm_container_app.main.ingress[0].fqdn}"

  depends_on = [
    azurerm_api_management.apim,
    azurerm_container_app.main,
    null_resource.wait_for_container_app
  ]
}

resource "azurerm_api_management_api_policy" "cors_policy" {
  api_name            = azurerm_api_management_api.backend_api.name
  resource_group_name = azurerm_resource_group.main.name
  api_management_name = azurerm_api_management.apim.name

  xml_content = templatefile("${path.module}/cors-policy.xml.tmpl", {
    allowed_origin = "https://${azurerm_static_web_app.frontend.default_host_name}"
  })
  depends_on = [azurerm_api_management_api.backend_api]
}
