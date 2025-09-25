FROM gitpod/workspace-node:20

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl netcat-traditional procps \
 && rm -rf /var/lib/apt/lists/*
USER gitpod
