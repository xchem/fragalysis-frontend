# Moorhen Migration Stage 19: Controlled Rollout

Stage 19 makes Moorhen the default viewer in development and allows staging or selected deployments to opt in while
keeping NGL available as the production default and emergency fallback.

## Selection Rules

Viewer configuration is resolved in this order:

1. An active rollback forces NGL.
2. `window.DJANGO_CONTEXT.viewer_engine` selects a runtime engine.
3. `VIEWER_ENGINE` selects a build-time engine.
4. An enabled Moorhen rollout selects Moorhen.
5. Development defaults to Moorhen; other environments default to NGL.

Runtime values override their build-time equivalents. Supported boolean values are `true`, `false`, `1`, `0`, `yes`,
`no`, `on`, and `off`, ignoring case.

| Purpose | Runtime Django context | Build environment |
| --- | --- | --- |
| Explicit engine | `viewer_engine` | `VIEWER_ENGINE` |
| Rollout switch | `moorhen_rollout_enabled` | `MOORHEN_ROLLOUT_ENABLED` |
| Emergency rollback | `moorhen_rollback` | `MOORHEN_ROLLBACK` |

Production remains on NGL unless the engine or rollout is explicitly configured. A staging deployment can opt in with
`MOORHEN_ROLLOUT_ENABLED=true`. Selected users can be opted in by rendering
`window.DJANGO_CONTEXT.viewer_engine = 'moorhen'` for their page before the frontend bundle loads.

## Fallback And Rollback

Moorhen initialization records CCP4 runtime and adapter registration failures. A failed lazy import, render, CCP4
startup, adapter registration, or 30-second initialization timeout switches the main viewer to NGL for that page load.
Secondary and summary viewers continue to use NGL during the controlled rollout.

For an environment-wide rollback, set one of the following and redeploy or reload the page:

```text
MOORHEN_ROLLBACK=true
```

```js
window.DJANGO_CONTEXT.moorhen_rollback = true;
```

Remove the value or set it to `false` to resume the configured rollout.

## Telemetry

The application emits structured console records prefixed with `[viewer-telemetry]` for:

- selected viewer and selection source;
- viewer initialization start, success, duration, and failure phase;
- automatic Moorhen-to-NGL fallback.

No external monitoring service is required. The latest 100 records can be inspected with:

```js
window.__FRAGALYSIS_VIEWER_TELEMETRY__
```

Consumers can also subscribe before viewer startup:

```js
window.addEventListener('fragalysis:viewer-telemetry', event => console.log(event.detail));
```

Sentry and its frontend dependency were removed because this deployment no longer uses it.

## Quick Manual Check

1. Start a normal development server without `VIEWER_ENGINE`; open Preview and confirm the main canvas uses Moorhen.
2. Load a protein, ligand, and map; confirm they overlap, rotate together, and snapshot/screenshot actions still work.
3. Inspect `window.__FRAGALYSIS_VIEWER_TELEMETRY__`; confirm `viewer.engine.selected` and a successful Moorhen initialization duration are present.
4. Start or deploy with `MOORHEN_ROLLBACK=true`; hard reload Preview and confirm the main canvas uses NGL and normal loading still works.
5. In staging, repeat the main Preview workflow with `MOORHEN_ROLLOUT_ENABLED=true`, then exercise the rollback once.

Cypress remains a CI check on machines where its browser runtime is available.
