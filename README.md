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
- Node.js 24 LTS (`24.18.0`)
- Corepack (install it with `npm install --global corepack` if `corepack --version` is unavailable)
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
node --version
corepack enable
yarn install
```

`node --version` should match `.node-version` (`v24.18.0`).

If `corepack enable` reports a permissions error, install its shims in the user-level npm directory instead:

```
corepack enable --install-directory "$(npm config get prefix)"
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

Open the application at [http://127.0.0.1:8080](http://127.0.0.1:8080). The backend must supply COOP (`same-origin`) and
COEP (`require-corp`) on the application document for Moorhen workers and `SharedArrayBuffer`. Development does not
inject missing backend headers: a misconfigured backend must fail locally as it would in a deployed stack.

When upgrading from a checkout with the former local nginx header mount, recreate the `web` container to remove it:

```sh
docker compose -f docker-compose.dev.vector.yml up -d --no-deps --force-recreate web
```

Production backend and platform requirements are listed in `docs/moorhen-static-deployment.md`.

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

Moorhen is the molecular viewer in all environments. There is no viewer selection or rollback flag. Its static asset
root defaults to `/bundles/moorhen` relative to the frontend bundle; deployments can override it with
`MOORHEN_ASSET_URL` at build time or `window.DJANGO_CONTEXT.moorhen_asset_url` before the bundle starts.

Viewer selection, initialization duration, and errors are logged as `[viewer-telemetry]` records.
The latest 100 records are available in `window.__FRAGALYSIS_VIEWER_TELEMETRY__` and are also dispatched as
`fragalysis:viewer-telemetry` browser events. The completed replacement is documented in
`docs/moorhen-migration-stages-20-21-moorhen-only.md`.

# Security patches

The `security` branch is a patch branch of `production` (issue #561).
Dependabot dependency updates collect on `security`. We can release them to
`production` when we need to, independently of the state of `staging`.
The backend uses the same process (see the "Security patches" section of the
[backend README](https://github.com/xchem/fragalysis-backend#security-patches)).

## How updates reach `security`

- `.github/dependabot.yml` (read only from `staging`, the default branch) sends
  Dependabot *version*-update pull requests to `security`. GitHub ignores
  `target-branch` for Dependabot *security* updates, so those still target
  `staging`.
- The **dependabot auto-merge** workflow enables auto-merge on a pull request
  when an open Dependabot alert for an updated package is at or above a
  minimum severity. The pull request merges (squashed) when its required checks
  pass. A pull request below the minimum severity stays open for manual review.
- The **build security (daily)** workflow starts the **build dev** workflow on
  `security` each day at 05:30 (UTC). **build dev** pushes the
  `xchem/fragalysis-frontend:security` image. It does not push the images of
  other branches.
- At 07:30 (UTC), the fragalysis-stack **build security** workflow builds a
  stack from the backend and frontend `security` images. It deploys the stack
  to the developer cluster for testing.

## Configuration

- Secret `DEPENDABOT_ALERTS_TOKEN` (a **Dependabot** secret): a fine-grained
  personal access token, or a GitHub App token, with
  "Dependabot alerts: Read-only" on this repository. The default `GITHUB_TOKEN`
  cannot read Dependabot alerts.
- Secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (**Actions** secrets),
  to push the `security` image.
- Variable `DEPENDABOT_AUTO_MERGE_MIN_SEVERITY`: `low`, `medium`, `high` or
  `critical` (default `high`).
- Repository setting "Allow auto-merge" must be on.
- The `security` branch protection must require the **build** check, so that
  auto-merge waits for the build. It must not require a linear history (see
  step 5 below).

## Releasing a patch

1. Open a pull request from `security` to `production`. Merge it with a
   **merge commit** (not a squash).
2. Tag `production` with the next production release number. The tag starts
   the **build production** workflow.
3. Open a pull request from `production` to `staging` (the back-merge). If
   `staging` changed dependencies, fix the `yarn.lock` conflicts with
   `yarn install`.
4. Fast-forward `security` to `production`:

        git fetch origin
        git push origin origin/production:refs/heads/security

5. After a normal `staging` → `production` release, update `security` again.
   If `security` has no unreleased patches, fast-forward it (as in step 4).
   If it has unreleased patches, merge `production` into `security`.

The **check back-merge** workflow fails a pull request to `production` if
`production` has a commit that is not in the pull request's branch. This stops
a release from `staging` before a back-merge is done.

## Where the workflow files must be

GitHub reads `dependabot.yml` and runs the **build security (daily)** and
**dependabot auto-merge** workflows only from `staging`, the default branch.
(GitHub runs a `pull_request_target` workflow from the default branch, not
from the pull request's base branch.) The dispatched **build dev** workflow
runs from `security`, so `security` must have the `workflow_dispatch` trigger
and the push steps in `build-dev.yaml`.

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

## Cypress tests

To run the automated Cypress tests, add the login credentials to your `.env` file:

```
CYPRESS_LOGIN=your_login
CYPRESS_PASSWORD=your_password
```

Install dependencies with Yarn:

```
corepack enable
yarn install
```

The tests run against the remote `baseUrl` configured in `cypress.config.ts`.
Override it for a CI preview stack or local backend with:

```
CYPRESS_BASE_URL=https://your-stack.example.org
```

Open the Cypress runner:

```
yarn runner
```

Run the Cypress suite headlessly:

```
yarn cy:run
```

Run the migration smoke suite headlessly:

```
yarn cy:smoke
```
