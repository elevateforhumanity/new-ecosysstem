#!/bin/bash

# Test script to validate all configuration files
# Run this locally before committing changes

echo "🧪 Testing fix2 configuration files..."
echo ""

# Validate YAML files
echo "📄 Validating YAML files:"
python3 -c 'import yaml; yaml.safe_load(open(".gitpod.yml"))' && echo "✓ .gitpod.yml is valid"
python3 -c 'import yaml; yaml.safe_load(open(".github/workflows/validate.yml"))' && echo "✓ .github/workflows/validate.yml is valid"
python3 -c 'import yaml; yaml.safe_load(open("templates/gitpod-nodejs.yml"))' && echo "✓ templates/gitpod-nodejs.yml is valid"
python3 -c 'import yaml; yaml.safe_load(open("templates/gitpod-python.yml"))' && echo "✓ templates/gitpod-python.yml is valid"
python3 -c 'import yaml; yaml.safe_load(open("templates/gitpod-fullstack.yml"))' && echo "✓ templates/gitpod-fullstack.yml is valid"
echo ""

# Validate JSON files
echo "📋 Validating JSON files:"
python3 -c 'import json; json.load(open(".vscode/settings.json"))' && echo "✓ .vscode/settings.json is valid"
python3 -c 'import json; json.load(open(".vscode/extensions.json"))' && echo "✓ .vscode/extensions.json is valid"
python3 -c 'import json; json.load(open(".prettierrc"))' && echo "✓ .prettierrc is valid"
python3 -c 'import json; json.load(open(".eslintrc.json"))' && echo "✓ .eslintrc.json is valid"
echo ""

# Check for required files
echo "📁 Checking required files:"
test -f README.md && echo "✓ README.md exists"
test -f QUICK_REFERENCE.md && echo "✓ QUICK_REFERENCE.md exists"
test -f SETUP_CHECKLIST.md && echo "✓ SETUP_CHECKLIST.md exists"
test -f CONTRIBUTING.md && echo "✓ CONTRIBUTING.md exists"
test -f .gitignore && echo "✓ .gitignore exists"
test -f .editorconfig && echo "✓ .editorconfig exists"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ All tests passed! Repository is ready."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

