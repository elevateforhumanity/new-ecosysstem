# Dev Autopilot Documentation

This document provides comprehensive information about the development autopilot system for the Elevate for Humanity ecosystem.

## Quick Start

### Option 1: Complete Setup (Recommended)
```bash
# Install all autopilot components
bash scripts/install-dev-autopilot.sh

# Start development environment
npm run dev:all
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm ci

# Start dev server only
npm run dev

# Or start with proxy
npm run dev:proxy  # In another terminal
```

## Environment Validation

Run environment checks before development:
```bash
npm run env:check
```

This validates:
- Node.js version (18.x recommended)
- Required files and dependencies
- Port availability
- Environment-specific configurations

## Available Scripts

### Core Development
- `npm run dev` - Start Vite dev server (port 8012)
- `npm run dev:proxy` - Start proxy server (port 9000 → 8012)
- `npm run dev:all` - Start both dev server and proxy
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Autopilot Tools
- `npm run plugins:fix` - Diagnose and fix plugin issues
- `npm run plugins:nuke` - Nuclear reset (rebuild all dependencies)
- `npm run env:check` - Validate development environment

### Quality Assurance
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (if available)

## Port Configuration

| Port | Service | Description |
|------|---------|-------------|
| 8012 | Vite Dev Server | Main development server |
| 9000 | Dev Proxy | Proxy server for external access |
| 4400 | API Server | Backend API (if running) |

## Environment Support

### GitHub Codespaces
- ✅ Automatic port forwarding
- ✅ Environment detection
- ✅ URL generation for forwarded ports
- 🎯 **Recommended**: Use port 9000 for external access

### Gitpod
- ✅ Workspace detection
- ✅ Dynamic URL generation with `gp url`
- ✅ Host watchdog for URL changes
- 🎯 **Recommended**: Share `gp url 9000`

### Local Development
- ✅ Standard localhost access
- ✅ Network interface binding
- 🎯 **Access**: http://localhost:9000/

## Autopilot Features

### Automatic Dependency Management
The autopilot system automatically:
- Detects ESM vs CommonJS modules
- Repairs dependency conflicts
- Rebuilds native modules (esbuild)
- Handles peer dependency issues

### Host Management
- **Gitpod**: Automatically allows dynamic hostnames
- **Codespaces**: Configures forwarded port hostnames
- **Local**: Standard localhost configuration

### Plugin Health Monitoring
```bash
# Check plugin health
npm run plugins:fix

# View diagnostic information
node scripts/plugins-diagnose.cjs

# Nuclear option if issues persist
npm run plugins:nuke
```

## Troubleshooting

### Build Errors
1. **PostCSS Issues**: Ensure `tailwindcss` plugin is configured correctly
2. **Import Errors**: Check for duplicate imports or wrong file extensions
3. **Type Errors**: Validate TypeScript configuration

```bash
# Quick fix attempt
npm run plugins:fix

# Nuclear option
npm run plugins:nuke
```

### Dev Server Issues
1. **Port Conflicts**: Check if ports 8012/9000 are available
2. **Host Issues**: Validate Vite configuration allows external access
3. **Proxy Errors**: Ensure target server is running

```bash
# Check environment
npm run env:check

# Restart with clean state
pkill -f vite || true
npm run dev:all
```

### Environment-Specific Issues

#### Codespaces
- Port forwarding may take a moment to activate
- Use the Ports tab to manage visibility
- Restart if forwarded URLs don't work

#### Gitpod
- URLs change when workspace restarts
- Use `gp url 9000` for shareable links
- Host watchdog automatically handles URL changes

#### Local Development
- Check firewall settings for network access
- Ensure no other services are using ports 8012/9000

## File Structure

```
scripts/
├── install-dev-autopilot.sh    # Main installer
├── dev-proxy.js                # Proxy server (9000 → 8012)
├── dev-start.sh                # Enhanced Vite starter
├── host-watchdog.sh            # Gitpod URL monitoring
├── plugins-diagnose.cjs        # Dependency health checker
├── plugins-nuke.sh             # Nuclear dependency reset
├── ci-health.sh                # CI health validation
└── validate-environment.sh     # Environment checker
```

## Configuration Files

- `vite.config.ts` - Vite configuration with proxy setup
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `package.json` - NPM scripts and dependencies

## CI/CD Integration

### GitHub Actions
The autopilot system includes CI workflows:
- **Build Check**: Validates builds on PRs
- **Preview Health**: Tests dev server and proxy
- **Cloudflare Pages**: Deploys to production

### Health Checks
```bash
# Run CI health checks locally
bash scripts/ci-health.sh
```

## Advanced Usage

### Custom Port Configuration
```bash
# Set custom ports
export VITE_DEV_PORT=3000
export PROXY_PORT=8000
npm run dev:all
```

### Manual Proxy Configuration
```javascript
// scripts/dev-proxy.js supports:
const TARGET = process.env.PROXY_TARGET || 'http://127.0.0.1:8012'
const PORT = process.env.PROXY_PORT || 9000
```

### Environment Variables
```bash
# Optional environment variables
VITE_DEV_PORT=8012          # Dev server port
PROXY_PORT=9000             # Proxy server port
API_PORT=4400               # API server port
```

## Support

### Getting Help
1. Run environment validation: `npm run env:check`
2. Check autopilot health: `npm run plugins:fix`
3. Review build output and error messages
4. Consult this documentation

### Reporting Issues
Include the following in issue reports:
- Output from `npm run env:check`
- Environment type (Codespaces/Gitpod/Local)
- Node.js and NPM versions
- Error messages and stack traces

## Best Practices

1. **Always start with**: `npm run env:check`
2. **Use autopilot installer**: `bash scripts/install-dev-autopilot.sh`
3. **Prefer `dev:all`**: Includes both server and proxy
4. **Regular health checks**: `npm run plugins:fix`
5. **Environment awareness**: Different commands for different environments