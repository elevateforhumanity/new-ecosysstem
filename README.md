# fix2 - Gitpod and VS Code Configuration Template

This repository provides a template configuration to fix VS Code and environment issues when working with Gitpod. Use these configuration files to ensure your repositories work correctly on Gitpod.

## 🚀 Quick Start

Click the button below to open this repository in Gitpod:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/elevateforhumanity/fix2)

## 📁 What's Included

This repository contains essential configuration files that ensure proper VS Code and environment setup in Gitpod:

### `.gitpod.yml`
The main Gitpod configuration file that:
- Specifies the Docker image to use
- Defines startup tasks and initialization scripts
- Lists VS Code extensions to install automatically
- Configures port forwarding
- Sets up GitHub prebuilds for faster workspace starts

### `.vscode/settings.json`
VS Code workspace settings that:
- Enable format on save
- Configure code formatting preferences
- Set up code actions (auto-fix, organize imports)
- Configure default formatters for different file types
- Set terminal and Git preferences

### `.vscode/extensions.json`
Recommended VS Code extensions including:
- ESLint for JavaScript/TypeScript linting
- Prettier for code formatting
- GitLens for enhanced Git capabilities
- Python support
- Docker support
- YAML support
- GitHub Copilot and Pull Request integration

## 🔧 How to Use This Template

### For New Repositories

1. **Copy configuration files to your repository:**
   ```bash
   # Copy .gitpod.yml
   cp .gitpod.yml /path/to/your/repo/
   
   # Copy .vscode directory
   cp -r .vscode /path/to/your/repo/
   ```

2. **Customize for your project:**
   - Edit `.gitpod.yml` to add your project-specific setup commands
   - Modify the `init` task to install dependencies (npm install, pip install, etc.)
   - Adjust port configurations based on your application
   - Add or remove VS Code extensions in both files

3. **Commit and push:**
   ```bash
   git add .gitpod.yml .vscode/
   git commit -m "Add Gitpod and VS Code configuration"
   git push
   ```

### For Existing Repositories

If you already have `.gitpod.yml` or `.vscode` configuration:

1. **Merge configurations carefully** - Don't overwrite existing settings
2. **Test in Gitpod** - Open your repository in Gitpod to verify everything works
3. **Adjust as needed** - Each project may have unique requirements

## 🛠️ Customization Guide

### Adding Project Dependencies

Edit the `init` section in `.gitpod.yml`:

```yaml
tasks:
  - name: Setup Environment
    init: |
      # Node.js project
      npm install
      
      # Python project
      pip install -r requirements.txt
      
      # Multiple commands
      npm install
      npm run build
```

### Configuring Ports

Add ports your application uses:

```yaml
ports:
  - port: 3000
    onOpen: open-browser  # Options: notify, open-browser, open-preview, ignore
    visibility: public     # Options: public, private
```

### Adding VS Code Extensions

Edit `.vscode/extensions.json` or add to `.gitpod.yml`:

```yaml
vscode:
  extensions:
    - publisher.extension-name
```

## 🐛 Common Issues and Solutions

### Issue: Extensions not installing automatically
**Solution:** Ensure extension IDs are correct in both `.gitpod.yml` and `.vscode/extensions.json`

### Issue: Workspace initialization fails
**Solution:** Check the `init` commands in `.gitpod.yml` for errors. View logs in Gitpod terminal.

### Issue: Port not accessible
**Solution:** Verify port configuration in `.gitpod.yml` and ensure your app is listening on `0.0.0.0` not `localhost`

### Issue: Formatting not working
**Solution:** Install the Prettier extension and ensure it's set as the default formatter in settings.json

## 📚 Resources

- [Gitpod Documentation](https://www.gitpod.io/docs)
- [Gitpod .gitpod.yml Reference](https://www.gitpod.io/docs/references/gitpod-yml)
- [VS Code Settings Reference](https://code.visualstudio.com/docs/getstarted/settings)
- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/vscode)

## 🤝 Contributing

Feel free to submit issues or pull requests to improve this template configuration.

## 📝 License

This configuration template is provided as-is for use in any project.
