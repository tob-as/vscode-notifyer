#!/usr/bin/env node
/**
 * Preflight Check - Verifies required environment variables exist
 *
 * Copy to: scripts/preflight.js
 *
 * Usage in package.json:
 * {
 *   "scripts": {
 *     "predev": "node scripts/preflight.js",
 *     "preflight": "node scripts/preflight.js"
 *   },
 *   "preflight": {
 *     "secrets": ["CUSTOM_API_KEY", "OTHER_SECRET"]
 *   }
 * }
 */

const fs = require('fs');
const path = require('path');

// Default required secrets (Cloudflare baseline)
const DEFAULT_SECRETS = [
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN',
];

// Load package.json to check for project-specific secrets
let requiredSecrets = DEFAULT_SECRETS;

try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.preflight?.secrets) {
      // Use project-specific list if defined
      requiredSecrets = packageJson.preflight.secrets;
    }
  }
} catch (error) {
  console.warn('⚠️  Could not read package.json, using default secrets');
}

// Check for missing secrets
const missing = requiredSecrets.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('');
  console.error('❌ Preflight Failed: Missing required secrets');
  console.error('');
  missing.forEach((key) => {
    console.error(`   ✗ ${key}`);
  });
  console.error('');
  console.error('Setup instructions:');
  console.error('  1. Create ~/.tob/env-setup.sh with your secrets');
  console.error('  2. Export CLAUDE_ENV_FILE=~/.tob/env-setup.sh');
  console.error('  3. Restart terminal');
  console.error('');
  console.error('See: docs/ONBOARDING.md');
  console.error('');
  process.exit(1);
}

// All good
console.log('✓ Preflight passed - all required secrets present');
console.log(`  Verified: ${requiredSecrets.join(', ')}`);
