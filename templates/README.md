# Configuration Templates

This directory contains pre-configured `.gitpod.yml` templates for common project types. Choose the one that best matches your project and customize as needed.

## 📁 Available Templates

### `gitpod-nodejs.yml`
**For:** Node.js, React, Vue, Angular, Next.js, Express projects

**Features:**
- Automatic `npm install` on workspace start
- Development server startup
- JavaScript/TypeScript extensions
- Port 3000 configured for web apps

**Usage:**
```bash
cp templates/gitpod-nodejs.yml .gitpod.yml
# Edit to customize npm scripts
```

### `gitpod-python.yml`
**For:** Python, Flask, Django, FastAPI projects

**Features:**
- Automatic pip dependency installation
- Python language support extensions
- Ports 8000 and 5000 configured
- Virtual environment ready

**Usage:**
```bash
cp templates/gitpod-python.yml .gitpod.yml
# Edit to customize Python commands
```

### `gitpod-fullstack.yml`
**For:** Full-stack applications with separate frontend and backend

**Features:**
- Parallel frontend and backend startup
- Multiple ports configured
- React and Node.js extensions
- Organized workspace tasks

**Usage:**
```bash
cp templates/gitpod-fullstack.yml .gitpod.yml
# Edit directory paths and scripts
```

## 🔧 Customization Tips

After copying a template:

1. **Update installation commands**
   - Change `npm install` to match your package manager (`yarn`, `pnpm`)
   - Add additional setup steps

2. **Modify start commands**
   - Update script names (`npm run dev`, `npm start`, etc.)
   - Add environment variable setup

3. **Adjust ports**
   - Match the ports your application uses
   - Set `onOpen` behavior (open-browser, notify, ignore)

4. **Add/remove extensions**
   - Include project-specific VS Code extensions
   - Remove unnecessary ones

## 💡 Need Help?

See the main [README.md](../README.md) for detailed documentation or [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) for quick commands.
