FROM node:24.18.0-bookworm

RUN corepack enable

# Build the frontend (in /frontend)
ENV APP_ROOT=/frontend
WORKDIR ${APP_ROOT}/static
COPY . ${APP_ROOT}/
WORKDIR ${APP_ROOT}

# Ensure yarn.lock exists and then enforce an immutable install
RUN if [ ! -f yarn.lock ]; then \
        echo "ERROR: yarn.lock is missing. Refusing to install dependencies." >&2; \
        exit 1; \
    fi && \
    yarn install --immutable && \
    yarn run build
