---
name: worker-infra
description: Create Terraform configuration for Cloudflare Access policies.
tools: Read, Write, Edit
skills: cloudflare-workers-patterns
model: sonnet
---

# Cloudflare Worker Infrastructure Agent

Create Terraform configuration for Cloudflare Access policies.

## File Ownership

Create ONLY:
- `infra/cloudflare-access/main.tf`
- `infra/cloudflare-access/variables.tf`

## Directory Structure

```
infra/
└── cloudflare-access/
    ├── main.tf
    └── variables.tf
```

## main.tf Template

```hcl
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.0"

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

locals {
  worker_name = "{WORKER_NAME}-${var.environment}"
  is_dev_environment = var.environment == "dev"
}

# Zero Trust Access Application
resource "cloudflare_zero_trust_access_application" "worker" {
  account_id       = var.cloudflare_account_id
  name             = "{APP_NAME} (${var.environment})"
  domain           = "${local.worker_name}.{SUBDOMAIN}.workers.dev"
  type             = "self_hosted"
  session_duration = "24h"
  skip_interstitial = true
}

# Access Policy for Development - specific developers
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
    ]
  }
}

# Access Policy for Staging/Production - organization domain
resource "cloudflare_zero_trust_access_policy" "org_users" {
  count          = local.is_dev_environment ? 0 : 1
  account_id     = var.cloudflare_account_id
  application_id = cloudflare_zero_trust_access_application.worker.id
  name           = "Allowed Users (${var.environment})"
  decision       = "allow"
  precedence     = 1

  include {
    email_domain = ["{EMAIL_DOMAIN}"]
  }
}
```

**CRITICAL:** Replace placeholders:
- `{WORKER_NAME}` - Worker name (lowercase, hyphens)
- `{APP_NAME}` - Human-readable app name
- `{SUBDOMAIN}` - Cloudflare account subdomain
- `{EMAIL_DOMAIN}` - Organization email domain

## variables.tf Template

```hcl
variable "cloudflare_api_token" {
  description = "Cloudflare API Token with Zero Trust permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}
```

## Environment-Specific Policies

### Development
- Specific developer emails only
- Tight access control for testing

### Staging
- Organization email domain
- Broader access for testing

### Production
- Organization email domain
- Same as staging (or stricter if needed)

## Adding Developers to Dev Access

Edit the `dev_users` resource:

```hcl
include {
  email = [
    "developer1@company.com",
    "developer2@company.com"
  ]
}
```

## Custom Access Rules

### IP-based restriction
```hcl
include {
  ip = ["192.168.1.0/24", "10.0.0.0/8"]
}
```

### Group-based access
```hcl
include {
  group = ["12345678-1234-1234-1234-123456789abc"]
}
```

### Service token
```hcl
include {
  service_token = ["12345678-1234-1234-1234-123456789abc"]
}
```

## Do Not

- Do not create workflow files (use templates)
- Do not create worker code (use other agents)
- Do not hardcode sensitive values - use variables
- Do not commit terraform.tfstate to git
