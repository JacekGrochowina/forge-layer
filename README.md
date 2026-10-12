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

## Running locally

Use Node.js 24 LTS (24.15.0 or newer within 24.x) and npm 11.
The reference version is Node.js 24.16.0, pinned in `.nvmrc`.
With nvm, run `nvm install` and `nvm use`; with nvm-windows, run
`nvm install 24.16.0` and `nvm use 24.16.0`.

Run the following commands from the repository root to install dependencies
and start the demo application:

```sh
npm ci
npx nx serve demo
```

Open [http://localhost:4200](http://localhost:4200) in your browser.
The server uses the development configuration and reloads the application
when source files change. Stop it with `Ctrl+C`.

To use a different port:

```sh
npx nx serve demo --port=4300
```

Then open [http://localhost:4300](http://localhost:4300).

The workspace contains one runnable application, `demo`. The `angular` project
is the component library imported directly from its source by the demo, so
it does not need a separate server or build before starting the application.
The `demo-e2e` project contains Playwright tests, described below.

To build and serve the production version locally:

```sh
npx nx run demo:serve-static
```

This builds the demo with the default production configuration and serves
`dist/demo/browser` at [http://localhost:4200](http://localhost:4200).
Stop any other server using port 4200 before running this command.

On Windows PowerShell, use `npm.cmd` and `npx.cmd` if execution policy blocks
the corresponding `.ps1` wrappers; no execution-policy change is needed.

## Storybook

Run `npm run storybook` and open http://localhost:6006.
Build the static documentation with `npm run build-storybook`; output is in
`dist/storybook/angular`.

Each component must provide five documentation pages, in this order:

1. **Overview** — purpose, recommended usage and a basic example.
2. **API** — inputs, outputs, types, defaults and content projection.
3. **Examples** — supported variants and real usage examples.
4. **States** — default, disabled, loading and applicable interaction states.
5. **Accessibility** — semantics, naming, keyboard behavior and manual checks.

Use `angular/src/lib/button` as the reference when adding components. Place
`<component>.stories.ts` and the five MDX pages alongside the component;
set the story title to `Components/<Component>` and attach each MDX page
with `<Meta of={ComponentStories} name="Overview" />` (using the appropriate
page name). The shared configuration discovers new files automatically and
keeps the five documentation pages in order. Stories are excluded from the
published library and its unit test compilation.

Include a controllable playground, representative examples, relevant state
stories and keyboard interaction checks. The Accessibility addon is enabled
for every component. Verify automated results plus keyboard focus, screen
reader naming and contrast in the application's theme. Icon fonts in the
preview are loaded from Google Fonts, as in the demo.

The configuration uses Storybook 10.6's Angular Vite framework, currently in
preview, with Angular's default zoneless change detection.

## Development and verification

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

Run the demo E2E scenarios in Chromium:

```sh
npx playwright install chromium
npx nx run demo-e2e:e2e --skip-nx-cache -- --project=chromium
```

Playwright starts and stops the demo server. Port 4200 must be available.
Set `PLAYWRIGHT_PORT` to use another port if a local demo is already running.
The scenarios cover the home page, navigation to Button, playground variants,
sizes and colors, and loading/disabled states.

## Continuous integration

The `CI` workflow runs on every pull request and push to `master`, and can also
be started manually in GitHub Actions. It uses Node.js from `.nvmrc`, `npm ci`,
lint for all three projects, unit tests, production builds of the library and
demo, and Playwright Chromium. Nx task caching is disabled for these checks.
Any failed check fails the workflow; E2E tests run without retries.

After an E2E failure, download the `playwright-failure` artifact from the workflow
run (retained for 14 days). It contains the HTML report and test output, including
traces and failure screenshots. Open the extracted report and traces with:

```sh
npx playwright show-report dist/.playwright/demo-e2e/playwright-report
npx playwright show-trace <path-to-trace.zip>
```

To require passing CI before merging, configure the repository's branch protection
or ruleset to require the `Lint, test, build and Chromium E2E` status check.

## License

TBD
