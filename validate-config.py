#!/usr/bin/env python3
"""
Configuration Validator for fix2 repository
Validates consistency across .gitpod.yml, devcontainer.json, and .vscode/extensions.json
"""

import json
import yaml
import sys
from pathlib import Path

def load_json(filepath):
    """Load JSON file, handling comments"""
    with open(filepath, 'r') as f:
        content = f.read()
        # Remove comments for JSON parsing
        lines = []
        for line in content.split('\n'):
            if not line.strip().startswith('//'):
                lines.append(line)
        return json.loads('\n'.join(lines))

def load_yaml(filepath):
    """Load YAML file"""
    with open(filepath, 'r') as f:
        return yaml.safe_load(f)

def main():
    print("🔍 Validating configuration consistency...\n")
    
    # Load configurations
    try:
        gitpod_config = load_yaml('.gitpod.yml')
        devcontainer_config = load_json('.devcontainer/devcontainer.json')
        vscode_config = load_json('.vscode/extensions.json')
    except Exception as e:
        print(f"❌ Error loading configuration files: {e}")
        return 1
    
    # Extract extensions
    gitpod_extensions = set(gitpod_config.get('vscode', {}).get('extensions', []))
    devcontainer_extensions = set(
        devcontainer_config.get('customizations', {})
        .get('vscode', {})
        .get('extensions', [])
    )
    vscode_extensions = set(vscode_config.get('recommendations', []))
    
    print(f"📦 Extensions found:")
    print(f"   .gitpod.yml: {len(gitpod_extensions)}")
    print(f"   devcontainer.json: {len(devcontainer_extensions)}")
    print(f"   .vscode/extensions.json: {len(vscode_extensions)}")
    print()
    
    # Check consistency
    all_match = gitpod_extensions == devcontainer_extensions == vscode_extensions
    
    if all_match:
        print("✅ All extension lists match perfectly!")
        print("\n📋 Extensions configured:")
        for ext in sorted(gitpod_extensions):
            print(f"   • {ext}")
        return 0
    else:
        print("⚠️  Extension lists differ:\n")
        
        # Find differences
        only_gitpod = gitpod_extensions - devcontainer_extensions - vscode_extensions
        only_devcontainer = devcontainer_extensions - gitpod_extensions - vscode_extensions
        only_vscode = vscode_extensions - gitpod_extensions - devcontainer_extensions
        
        if only_gitpod:
            print("Only in .gitpod.yml:")
            for ext in sorted(only_gitpod):
                print(f"   • {ext}")
            print()
        
        if only_devcontainer:
            print("Only in devcontainer.json:")
            for ext in sorted(only_devcontainer):
                print(f"   • {ext}")
            print()
        
        if only_vscode:
            print("Only in .vscode/extensions.json:")
            for ext in sorted(only_vscode):
                print(f"   • {ext}")
            print()
        
        # Common extensions
        common = gitpod_extensions & devcontainer_extensions & vscode_extensions
        if common:
            print(f"✅ Common extensions ({len(common)}):")
            for ext in sorted(common):
                print(f"   • {ext}")
        
        return 0  # Not a failure, just informational

if __name__ == '__main__':
    sys.exit(main())
