# Gitpod Custom Dockerfile
FROM gitpod/workspace-full:latest

# Set non-interactive mode for apt-get
ENV DEBIAN_FRONTEND=noninteractive

# Install global dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    nano \
    jq \
    ripgrep \
    tree \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 16 using NVM (if not available)
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn

# Set the correct Node.js version
ENV NODE_VERSION=16

# Set up Yarn global bin directory
ENV PATH="/home/gitpod/.yarn/bin:${PATH}"

# Install additional global npm packages if needed
RUN npm install -g typescript eslint prettier

# Set workspace permissions (fixes permission issues in some environments)
RUN chown -R gitpod:gitpod /workspace

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Set default shell to bash
SHELL ["/bin/bash", "-c"]

# Set up project-specific environment variables
ENV NODE_ENV=development
ENV API_URL="https://api.example.com"
