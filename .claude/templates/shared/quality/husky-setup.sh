#!/bin/bash
# Husky Pre-commit Hook Setup
# Run this script in project root to set up git hooks

set -e

echo "Setting up Husky pre-commit hooks..."

# Install husky
npm install --save-dev husky lint-staged

# Initialize husky
npx husky init

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
npx lint-staged
EOF

chmod +x .husky/pre-commit

# Add lint-staged config to package.json
# Note: This should be added manually or via npm pkg set
echo ""
echo "Add the following to your package.json:"
echo ""
cat << 'EOF'
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
EOF

echo ""
echo "✓ Husky setup complete"
echo "Pre-commit hook will run ESLint and Prettier on staged files"
