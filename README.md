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

- a PostgreSQL database
- a neo4j graph database
- the fraglaysis stack

The stack is formed from code resident in a number of repositories.
Begin by forking repositories you anticipate editing (although you really want
to consider forking all the repositories as this is a relatively low-cost
operation).

The repositories are:

- [xchem/fragalysis](https://github.com/xchem/fragalysis)
- [xchem/fragalysis-frontend](https://github.com/xchem/fragalysis-frontend)
- [xchem/fragalysis-backend](https://github.com/xchem/fragalysis-backend)
- [xchem/fragalysis-stack](https://github.com/xchem/fragalysis-stack)

## Prerequisites

- Docker
- Git
- NodeJS (v16)
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
git clone https://github.com/xchem/fragalysis-frontend.git
```

_Note: Fork if any work is expected._

### Optional

```
git clone https://github.com/xchem/fragalysis-backend.git
git clone https://github.com/xchem/fragalysis-stack.git
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

### Modify `fragalysis-frontend/docker-compose.dev.vector.yml` file to look at right data folders

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
docker-compose -f docker-compose.dev.vector.yml up -d
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

if you are running out of space then you can run

```
docker system prune --volumes
```

which will physically purge containers

And then run docker-compose as usual.

# How to debug remote stack

Navigate to /js/components/routes/constants.js and change value of

```js
isRemoteDebugging;
```

to true.

Then pick the stack from the list

```js
export const base_url = window.location.protocol + '//' + window.location.host; //url for local developement
// export const base_url = 'https://fragalysis-tibor-default.xchem-dev.diamond.ac.uk'; //url for debugging on main dev pod
//export const base_url = 'https://fragalysis-boris-default.xchem-dev.diamond.ac.uk'; //url for debugging on secondary dev pod
//export const base_url = 'https://fragalysis.xchem.diamond.ac.uk'; //url for debugging staging
// export const base_url = 'https://fragalysis.diamond.ac.uk'; //url for debugging production
```

Uncomment that line and comment out the line

```js
export const base_url = window.location.protocol + '//' + window.location.host; //url for local developement
```

which is used to for local development.

To return back to debug local stack just revert above mentioned changes.

## To debug jobs

Currently it's not possible to fully debug the job execution but it's possible to debug parts of the process.
You can debug file transfer and initial job request locally but the upload of the result file and job status
doesn't work your IP address is not public so Squonk can't make the callback. This (refresh feature) has to be debugged remotely.

Deploy given stack to one of the dev stacks execute job there, connect you local dev env to given remote stack,
like described above, and you can debug refresh and initial download of the result file.

But remember, you need to make it to the job table or project history (where refresh button is located) **before** the job is finished in squonk otherwise the result file will be downloaded during the intial load of the preview component, so you would not be able to debug refresh feature.
