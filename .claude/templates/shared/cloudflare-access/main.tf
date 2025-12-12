terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0"

  # State persisted via GitHub Actions cache per environment (dev/staging/prod)
  # For production, consider Terraform Cloud or S3 backend
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

locals {
  worker_name = "{{WORKER_NAME}}-${var.environment}"

  # Access Policy: Dev = specific developers, Staging/Prod = all @{{EMAIL_DOMAIN}}
  is_dev_environment = var.environment == "dev"
}

# Zero Trust Access Application (managed via Terraform)
resource "cloudflare_zero_trust_access_application" "worker" {
  account_id       = var.cloudflare_account_id
  name             = "{{APP_NAME}} (${var.environment})"
  domain           = "${local.worker_name}.{{CLOUDFLARE_SUBDOMAIN}}.workers.dev"
  type             = "self_hosted"
  session_duration = "24h"

  # Skip interstitial page for better UX
  skip_interstitial = true
}

# Access Policy for Development - specific developers only
resource "cloudflare_zero_trust_access_policy" "dev_users" {
  count          = local.is_dev_environment ? 1 : 0
  account_id     = var.cloudflare_account_id
  application_id = cloudflare_zero_trust_access_application.worker.id
  name           = "Allowed Users (${var.environment})"
  decision       = "allow"
  precedence     = 1

  include {
    email = [
      # Add developer emails here
      # "developer@{{EMAIL_DOMAIN}}"
    ]
  }
}

# Access Policy for Staging/Production - all domain users
resource "cloudflare_zero_trust_access_policy" "org_users" {
  count          = local.is_dev_environment ? 0 : 1
  account_id     = var.cloudflare_account_id
  application_id = cloudflare_zero_trust_access_application.worker.id
  name           = "Allowed Users (${var.environment})"
  decision       = "allow"
  precedence     = 1

  include {
    email_domain = ["{{EMAIL_DOMAIN}}"]
  }
}
