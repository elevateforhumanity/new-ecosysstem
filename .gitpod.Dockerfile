FROM gitpod/workspace-node:20

USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    inotify-tools jq curl ca-certificates procps \
 && rm -rf /var/lib/apt/lists/*

# Raise file watcher limits for hot reload at OS level
RUN echo fs.inotify.max_user_watches=524288 >> /etc/sysctl.conf && \
    echo fs.inotify.max_user_instances=1024 >> /etc/sysctl.conf

USER gitpod
