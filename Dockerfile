FROM node:22-bookworm

# Install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update -y && \
    apt-get install -y \
    yarn && \
    apt-get clean

# Build the frontend (in /frontend)
ENV APP_ROOT /frontend
WORKDIR ${APP_ROOT}/static
COPY . ${APP_ROOT}/
WORKDIR ${APP_ROOT}

# Ensure yarn.lock exists and then enforce frozen lockfile
RUN if [ ! -f yarn.lock ]; then \
        echo "ERROR: yarn.lock is missing. Refusing to install dependencies." >&2; \
        exit 1; \
    fi && \
    yarn install --frozen-lockfile && \
    yarn run build
