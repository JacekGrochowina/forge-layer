# Forge Layer

Application-ready UI components for Angular.

Forge Layer is a UI library built on top of Angular Material.
It provides reusable, opinionated components designed to solve
common problems found in real-world business applications.

## Why?

Angular Material provides excellent UI primitives, but application
development often requires additional behavior, validation,
loading states, consistent UX and reusable patterns.

Forge Layer aims to provide that additional layer.

## Planned Components

- forge-button
- forge-input
- forge-select
- forge-dialog
- forge-toast
- forge-loading
- forge-empty-state
- forge-table

## Status

🚧 Early development

## Tech Stack

- Angular
- Angular Material
- Angular CDK
- TypeScript

## Development and verification

Use Node.js 24 LTS (24.15.0 or newer within 24.x) and npm 11.
The reference version is Node.js 24.16.0, pinned in `.nvmrc`.
With nvm, run `nvm install` and `nvm use`; with nvm-windows, run
`nvm install 24.16.0` and `nvm use 24.16.0`.

From a clean checkout, install the exact dependencies in `package-lock.json`
and run all six checks without reusing Nx task results:

```sh
npm ci
npm run verify
```

The equivalent individual checks are:

```sh
npx nx lint angular --skip-nx-cache
npx nx lint demo --skip-nx-cache
npx nx test angular --skip-nx-cache
npx nx test demo --skip-nx-cache
npx nx build angular --configuration=production --skip-nx-cache
npx nx build demo --configuration=production --skip-nx-cache
```

Tests run once (`watch: false`). Builds use the production configuration by
default and write to `dist/angular` and `dist/demo`. Verification exits with
a nonzero status if any check fails. E2E tests are separate from these checks.

On Windows PowerShell, use `npm.cmd` and `npx.cmd` if execution policy blocks
the corresponding `.ps1` wrappers; no execution-policy change is needed.

Start the demo with `npx nx serve demo` and open `http://localhost:4200`.

## License

TBD
