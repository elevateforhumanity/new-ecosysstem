FROM gitpod/workspace-node:20

# Enterprise dependencies for image processing, security, and build tools
USER root
RUN apt-get update && apt-get install -y \
    libvips-dev \
    jq \
    curl \
    ca-certificates \
    git \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Switch back to gitpod user for security
USER gitpod

# Pre-install global tools for faster workspace startup
RUN npm install -g pnpm@9.7.0 && \
    corepack enable && \
    corepack prepare pnpm@9.7.0 --activate
