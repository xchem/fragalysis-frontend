FROM node:12.22.12-buster

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
RUN yarn install && \
    yarn run build
