# Quick Reference Guide

## 🎯 Quick Copy Commands

### Copy all configuration to your repository
```bash
# Clone this template repository first
git clone https://github.com/elevateforhumanity/fix2.git
cd fix2

# Copy to your project (replace /path/to/your/project)
cp .gitpod.yml /path/to/your/project/
cp -r .vscode /path/to/your/project/
cp .editorconfig /path/to/your/project/
cp .gitignore /path/to/your/project/  # Merge if it already exists
```

## 🔧 Common Customizations

### Add Node.js project dependencies
```yaml
# In .gitpod.yml
tasks:
  - name: Setup Environment
    init: |
      npm install
    command: |
      npm start
```

### Add Python project dependencies
```yaml
# In .gitpod.yml
tasks:
  - name: Setup Environment
    init: |
      pip install -r requirements.txt
    command: |
      python app.py
```

### Add custom port
```yaml
# In .gitpod.yml
ports:
  - port: 5000
    onOpen: open-browser
    visibility: public
```

## 📦 Essential VS Code Extensions

Already included in the configuration:
- ✅ ESLint - JavaScript/TypeScript linting
- ✅ Prettier - Code formatting
- ✅ GitLens - Git supercharged
- ✅ Python - Python language support
- ✅ Docker - Docker support
- ✅ YAML - YAML language support
- ✅ GitHub Copilot - AI pair programmer
- ✅ GitHub Pull Requests - PR management

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Workspace won't start | Check `.gitpod.yml` syntax with a YAML validator |
| Extensions not installing | Verify extension IDs are correct |
| Port not accessible | Ensure app listens on `0.0.0.0`, not `localhost` |
| Formatting not working | Install Prettier extension manually if needed |

## 🚀 Open in Gitpod

Just prefix your GitHub URL with `gitpod.io/#`:

```
https://gitpod.io/#https://github.com/your-username/your-repo
```

Or add a button to your README:
```markdown
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#YOUR_REPO_URL)
```
