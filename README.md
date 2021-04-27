[![build main](https://github.com/xchem/fragalysis-frontend/actions/workflows/build-main.yaml/badge.svg)](https://github.com/xchem/fragalysis-frontend/actions/workflows/build-main.yaml)

[![Version](http://img.shields.io/badge/version-0.1.0-blue.svg?style=flat)](https://github.com/xchem/fragalysis-frontend)
[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/xchem/fragalysis-frontend/blob/master/LICENSE)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/xchem/fragalysis-frontend.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/xchem/fragalysis-frontend/context:javascript)

# The frontend for the fragalysis tool

- React, Redux and built using Webpack

# XCHEM FRAGALYSIS Frontend Dev environment setup

## Background

The stack consists of three services, running as containers: -

- a MySQL database
- a neo4j graph database
- the fraglaysis stack
- a transient data loader container

The stack is formed from code resident in a number of repositories.
Begin by forking repositories you anticipate editing (although you really want
to consider forking all the repositories as this is a relatively low-cost
operation).

The repositories are:

- [xchem/fragalysis](https://github.com/xchem/fragalysis)
- [xchem/fragalysis-frontend](https://github.com/xchem/fragalysis-frontend)
- [xchem/fragalysis-backend](https://github.com/xchem/fragalysis-backend)
- [xchem/fragalysis-stack](https://github.com/xchem/fragalysis-stack)
- [xchem/fragalysis-loader](https://github.com/xchem/fragalysis-loader)

## Prerequisites

- Docker
- Git
- NodeJS (v12)
- Yarn
- Some target data

## Setup

Start with creating project directory, e.g.

```
mkdir fragalysis
```

Clone repositories

_Note: You might want to work on `frontend` fork._

```
# git clone https://github.com/xchem/fragalysis-frontend.git
git clone https://github.com/pavol-brunclik-m2ms/fragalysis-frontend.git
```

_Note: Fork if any work is expected._

### Optional

```
git clone https://github.com/xchem/fragalysis-backend.git
git clone https://github.com/xchem/fragalysis-loader.git
git clone https://github.com/xchem/fragalysis-stack.git
```

### Mandatory

```
# git clone https://github.com/xchem/dls-fragalysis-stack-openshift.git (Did not contain 'loader' image)
git clone https://github.com/InformaticsMatters/dls-fragalysis-stack-openshift.git
```

## Build the images locally

### Optional

```
pushd fragalysis-backend || exit
docker build . -t xchem/fragalysis-backend:latest
popd || exit

pushd fragalysis-loader || exit
docker build . -t xchem/fragalysis-loader:latest
popd || exit

pushd fragalysis-stack || exit
docker build . -t xchem/fragalysis-stack:latest
popd || exit
```

### Mandatory

```
pushd dls-fragalysis-stack-openshift/images/loader || exit
docker build . -f Dockerfile-local -t loader:latest
popd || exit
```

### Optional

```
pushd dls-fragalysis-stack-openshift/images/graph || exit
docker build . -t xchem/graph:latest
popd || exit
```

## Create some key data directories

Note: The data/input/django_data directory will need to be populated with EXAMPLE data before you can launch the application.

```
mkdir -p data/input/django_data/EXAMPLE
mkdir -p data/neo4j/data
mkdir -p data/neo4j/logs
mkdir -p data/stack/media
mkdir -p data/stack/logs
mkdir -p data/media/compound_sets
mkdir -p data/postgre/data
```

### Modify `fragalysis-frontend/docker-compose.dev.yml` file to look at right loader

- `../data` folders
- `DATA_ORIGIN: EXAMPLE` -> will look for `EXAMPLE` folder in ../data/input/django_data/EXAMPLE

```
cd fragalysis-frontend/
yarn
```

Start webpack dev server

```
yarn start
```

Start fragalysis stack

```
docker-compose -f docker-compose.dev.yml up -d
```

`Please wait, it takes a minute until all containers are fully started.`

Test if we are running at [http://localhost:8080](http://localhost:8080)

If needed stop containers

```
docker-compose -f docker-compose.dev.yml down
```

### React webpack hot reloading

Inspired by https://owais.lone.pw/blog/webpack-plus-reactjs-and-django/ and https://github.com/gaearon/react-hot-boilerplate/ and https://github.com/webpack-contrib/webpack-hot-middleware/issues/255

### Notes

To connect to `web_dock` container

```
docker exec -it web_dock /bin/bash
```

# IDEs
### WebStorm, PhpStorm
Please install following extension Prettier

```
Go to: Preferences, Tools, File watchers
Add Prettier
Prettier reccomended settings: Files to watch - Scope - All changed files
```

During the commit in this IDE, check `Run Git hooks`

### Visual Studio Code
Please install following extensions

Prettier - Code formatter https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

ES-lint https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

# Environments
to activate GitHub api create `.env` file and following environment variable

```
GITHUB_API_TOKEN=myGitHubToken
```

To create .env with token right away:

```
echo "GITHUB_API_TOKEN=myGitHubToken" > .env
```

# When backend and/or loader are updated
Update backend repo from xchem/fragalysis-backend master branch

Get rid of old docker images. You may prune all (BEWARE) images from docker by using command.

```
docker system prune -a
```

Rebuild loader image:

```
pushd dls-fragalysis-stack-openshift/images/loader || exit
docker build . -f Dockerfile-local -t loader:latest
popd || exit
```

And then run docker-compose as usual.
