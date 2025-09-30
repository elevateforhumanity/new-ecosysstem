data "cloudflare_zone" "zone" { name = var.zone_name }

resource "cloudflare_record" "www_cname" {
  zone_id = data.cloudflare_zone.zone.id
  name    = "www"
  type    = "CNAME"
  value   = "${cloudflare_pages_project.site.name}.pages.dev"
  proxied = true
}

resource "cloudflare_pages_project" "site" {
  account_id        = data.cloudflare_zone.zone.account_id
  name              = "efh-site"     # change to your actual project name
  production_branch = "main"
  build_config {
    build_command   = "npm run build"
    destination_dir = "dist"
  }
}
