#!/usr/bin/env bash
# scripts/install-video-deps.sh
# Install dependencies for hero video generation

set -euo pipefail

echo "📦 Installing video generation dependencies..."

# Update package lists
sudo apt-get update

# Install ffmpeg for video processing
echo "🎬 Installing ffmpeg..."
sudo apt-get install -y ffmpeg

# Install canvas dependencies for Node.js
echo "🎨 Installing canvas dependencies..."
sudo apt-get install -y \
  build-essential \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev

# Install fonts for better text rendering
echo "🔤 Installing fonts..."
sudo apt-get install -y \
  fonts-dejavu \
  fonts-liberation \
  fonts-noto

# Install AWS CLI for Polly (if not already installed)
if ! command -v aws >/dev/null 2>&1; then
  echo "☁️ Installing AWS CLI..."
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  unzip -q awscliv2.zip
  sudo ./aws/install
  rm -rf aws awscliv2.zip
fi

# Install Node.js canvas package
echo "📦 Installing Node.js canvas package..."
npm install canvas

echo "✅ Video generation dependencies installed successfully!"
echo ""
echo "🎯 Available commands:"
echo "  npm run video:hero    - Generate hero video"
echo "  npm run video:replace - Replace homepage video"
echo "  npm run video:verify  - Verify video replacement"
echo ""
echo "🔧 Optional: Set these environment variables for enhanced features:"
echo "  POLLY_VOICE=Joanna           # AWS Polly voice for narration"
echo "  AWS_ACCESS_KEY_ID=...        # AWS credentials for Polly"
echo "  AWS_SECRET_ACCESS_KEY=...    # AWS credentials for Polly"
echo "  R2_ACCESS_KEY_ID=...         # Cloudflare R2 for video hosting"
echo "  R2_SECRET_ACCESS_KEY=...     # Cloudflare R2 credentials"
echo "  R2_BUCKET=elevate-public     # R2 bucket name"