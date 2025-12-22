locals {
  name_prefix     = "${var.project}-${var.application}-${var.environment}-${var.location_short}"
  rg_name         = "${local.name_prefix}-rg"
  asw_name        = "${local.name_prefix}-asw"

  tags = {
    project     = var.project
    application = var.application
    environment = var.environment
    location    = var.location
    blockcode   = var.blockcode
  }
}

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = local.rg_name
  location = var.location
  tags     = local.tags
}

# Azure Container Registry (ACR)
resource "azurerm_container_registry" "acr" {
  name                = "${replace(local.name_prefix, "-", "")}registry"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}
