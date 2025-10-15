# EFH Autopilot Launcher for Windows
# One-click hiring automation

param(
    [switch]$RunCLI,
    [switch]$GenerateJobs,
    [switch]$SeedGitHub,
    [switch]$ExportCandidates,
    [switch]$CreateInvite,
    [switch]$TestSlack,
    [switch]$Setup
)

$ErrorActionPreference = "Stop"

# Colors
function Write-Header {
    param([string]$Text)
    Write-Host "`n$Text" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor Red
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor Yellow
}

# Banner
Clear-Host
Write-Header "🤖 EFH Autopilot Launcher"
Write-Host "Hiring automation for Elevate for Humanity`n" -ForegroundColor Gray

# Check if we're in the right directory
if (-not (Test-Path "no-site")) {
    Write-Error "no-site directory not found!"
    Write-Info "Please run this script from the repository root"
    exit 1
}

# Change to no-site directory
Set-Location no-site

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Info "Node.js version: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed!"
    Write-Info "Download from: https://nodejs.org/"
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Warning "Dependencies not installed. Installing now..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    Write-Success "Dependencies installed"
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Warning ".env file not found!"
    Write-Info "Running setup wizard..."
    npm run setup
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Setup failed"
        exit 1
    }
}

# Check DRY_RUN status
$envContent = Get-Content .env -Raw
if ($envContent -match "DRY_RUN=true") {
    Write-Warning "DRY RUN MODE: No actual changes will be made"
    Write-Host "   Set DRY_RUN=false in .env to enable writes`n" -ForegroundColor Gray
} else {
    Write-Warning "LIVE MODE: Changes will be made to GitHub"
    Write-Host "   Set DRY_RUN=true in .env for safe testing`n" -ForegroundColor Gray
}

# Execute based on parameters
if ($Setup) {
    Write-Info "Running setup wizard..."
    npm run setup
    exit $LASTEXITCODE
}

if ($GenerateJobs) {
    Write-Info "Generating job posts..."
    npm run generate:jobs
    exit $LASTEXITCODE
}

if ($SeedGitHub) {
    Write-Info "Seeding GitHub..."
    npm run seed:github
    exit $LASTEXITCODE
}

if ($ExportCandidates) {
    Write-Info "Exporting candidates..."
    npm run export:candidates
    exit $LASTEXITCODE
}

if ($CreateInvite) {
    Write-Info "Creating interview invite..."
    npm run create:invite
    exit $LASTEXITCODE
}

if ($TestSlack) {
    Write-Info "Testing Slack integration..."
    npm run test:slack
    exit $LASTEXITCODE
}

if ($RunCLI) {
    Write-Info "Starting interactive CLI..."
    npm start
    exit $LASTEXITCODE
}

# No parameters - show menu
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  .\launch-efh-autopilot.ps1                # Show this menu" -ForegroundColor Gray
Write-Host "  .\launch-efh-autopilot.ps1 -RunCLI        # Interactive menu" -ForegroundColor Gray
Write-Host "  .\launch-efh-autopilot.ps1 -GenerateJobs  # Generate job posts" -ForegroundColor Gray
Write-Host "  .\launch-efh-autopilot.ps1 -SeedGitHub    # Seed GitHub" -ForegroundColor Gray
Write-Host "  .\launch-efh-autopilot.ps1 -ExportCandidates  # Export CSV" -ForegroundColor Gray
Write-Host "  .\launch-efh-autopilot.ps1 -CreateInvite  # Create interview invite" -ForegroundColor Gray
Write-Host "  .\launch-efh-autopilot.ps1 -TestSlack     # Test Slack" -ForegroundColor Gray
Write-Host "  .\launch-efh-autopilot.ps1 -Setup         # Run setup wizard`n" -ForegroundColor Gray

$choice = Read-Host "Press Enter to start interactive CLI, or Ctrl+C to exit"
npm start
