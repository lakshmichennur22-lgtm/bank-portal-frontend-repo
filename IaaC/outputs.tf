output "container_fqdn" {
  value = azurerm_container_app.main.ingress[0].fqdn
}
