import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const consumer = mkdtempSync(join(tmpdir(), 'forge-package-'));
const env = {
  ...process.env,
  NX_DAEMON: 'false',
  NX_NO_CLOUD: 'true',
  NG_CLI_ANALYTICS: 'false',
};
function npm(args, cwd = root, capture = false) {
  // Invoke the npm CLI with Node, avoiding shell quoting and Windows .cmd wrappers.
  const cli = process.env.npm_execpath;
  assert(cli, 'Run this script using npm run test:package');
  return execFileSync(process.execPath, [cli, ...args], {
    cwd,
    env,
    stdio: capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
  });
}
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
console.log(`Isolated consumer: ${consumer}`);
execFileSync(
  process.execPath,
  [
    join(root, 'node_modules/nx/dist/bin/nx.js'),
    'build',
    'angular',
    '--skip-nx-cache',
  ],
  { cwd: root, env, stdio: 'inherit' },
);
const built = json(join(root, 'dist/angular/package.json'));
const bundle = [built.module, built.typings]
  .map((file) => readFileSync(join(root, 'dist/angular', file), 'utf8'))
  .join('\n');
const importedPackages = [
  ...bundle.matchAll(/from\s+['"]([^.'"][^'"]*)['"]/g),
].map((match) =>
  match[1].startsWith('@')
    ? match[1].split('/').slice(0, 2).join('/')
    : match[1].split('/')[0],
);
for (const dependency of new Set(importedPackages)) {
  assert(
    built.peerDependencies?.[dependency] || built.dependencies?.[dependency],
    `Undeclared runtime dependency: ${dependency}`,
  );
}
assert(
  !built.peerDependencies['@angular/cdk'],
  'Reassess CDK only when directly imported',
);
assert.equal(built.license, 'MIT');
assert(built.description && built.repository.url && built.homepage);
cpSync(join(root, 'tools/package-smoke'), consumer, { recursive: true });
const [packed] = JSON.parse(
  npm(
    ['pack', './dist/angular', '--pack-destination', consumer, '--json'],
    root,
    true,
  ),
);
for (const required of ['LICENSE', 'README.md', built.module, built.typings]) {
  assert(
    packed.files.some((file) => file.path === required.replace(/^\.\//, '')),
    `Missing packaged file: ${required}`,
  );
}
const versions = (name) =>
  json(join(root, 'node_modules', name, 'package.json')).version;
const dependencies = Object.fromEntries(
  [
    '@angular/common',
    '@angular/compiler',
    '@angular/core',
    '@angular/forms',
    '@angular/platform-browser',
    '@angular/material',
    'rxjs',
    'tslib',
  ].map((name) => [name, versions(name)]),
);
dependencies[built.name] = `file:./${packed.filename}`;
writeFileSync(
  join(consumer, 'package.json'),
  JSON.stringify(
    {
      name: 'forge-package-consumer',
      private: true,
      dependencies,
      devDependencies: Object.fromEntries(
        [
          '@angular/build',
          '@angular/cli',
          '@angular/compiler-cli',
          'typescript',
        ].map((name) => [name, versions(name)]),
      ),
    },
    null,
    2,
  ),
);
npm(['install', '--strict-peer-deps', '--no-audit', '--no-fund'], consumer);
npm(['ls', '--all'], consumer, true);
const installed = join(consumer, 'node_modules/@forge-layer/angular');
assert(realpathSync(installed).startsWith(realpathSync(consumer) + sep));
assert.equal(
  readFileSync(join(installed, 'LICENSE'), 'utf8'),
  readFileSync(join(root, 'LICENSE'), 'utf8'),
);
// Bundle the real icon font into the temporary app, so browser checks need no network.
const cssResponse = await fetch(
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  { signal: AbortSignal.timeout(30_000) },
);
assert(cssResponse.ok, 'Could not download Material Icons CSS');
let iconCss = await cssResponse.text();
for (const match of [...iconCss.matchAll(/url\((https:\/\/[^)]+)\)/g)]) {
  const response = await fetch(match[1], {
    signal: AbortSignal.timeout(30_000),
  });
  assert(response.ok, 'Could not download Material Icons font');
  const font = Buffer.from(await response.arrayBuffer());
  iconCss = iconCss.replace(
    match[0],
    `url(data:font/woff2;base64,${font.toString('base64')})`,
  );
}
writeFileSync(join(consumer, 'src/icons.css'), iconCss);
const config = json(join(consumer, 'angular.json'));
config.projects.consumer.architect.build.options.styles.push('src/icons.css');
writeFileSync(join(consumer, 'angular.json'), JSON.stringify(config, null, 2));
npm(['exec', '--', 'ng', 'build'], consumer);
const browserRoot = join(consumer, 'dist/browser');
const server = createServer((request, response) => {
  const path = resolve(
    browserRoot,
    '.' + new URL(request.url, 'http://localhost').pathname,
  );
  const file = path === browserRoot ? join(path, 'index.html') : path;
  if (!file.startsWith(browserRoot + sep) || !existsSync(file)) {
    response.writeHead(404).end();
    return;
  }
  response.setHeader(
    'Content-Type',
    file.endsWith('.js')
      ? 'text/javascript'
      : file.endsWith('.css')
        ? 'text/css'
        : 'text/html',
  );
  response.end(readFileSync(file));
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('output')).toHaveText('1');
  await expect(
    page.locator('forge-button').nth(2).locator('button'),
  ).toBeDisabled();
  assert.equal(await page.locator('mat-spinner').count(), 1);
  assert((await page.locator('mat-spinner svg').count()) > 0);
  assert.equal(
    await page
      .getByRole('button', { name: 'Delete' })
      .locator('mat-icon')
      .textContent(),
    'delete',
  );
  const state = await page
    .locator('forge-button')
    .first()
    .evaluate(async (host) => {
      await document.fonts.ready;
      const button = host.querySelector('button');
      const icon = host.querySelector('mat-icon');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = '24px "Material Icons"';
      const swatch = document.createElement('span');
      swatch.style.backgroundColor = 'var(--mat-sys-primary)';
      document.body.append(swatch);
      const expectedBackground = getComputedStyle(swatch).backgroundColor;
      swatch.remove();
      return {
        primary: getComputedStyle(document.documentElement)
          .getPropertyValue('--mat-sys-primary')
          .trim(),
        background: getComputedStyle(button).backgroundColor,
        expectedBackground,
        endIcon: icon.hasAttribute('iconPositionEnd'),
        fontLoaded: document.fonts.check('24px "Material Icons"'),
        ligatureWidth: context.measureText('save').width,
      };
    });
  assert(
    state.primary && state.background !== 'rgba(0, 0, 0, 0)',
    'Material theme missing',
  );
  assert.equal(
    state.background,
    state.expectedBackground,
    'Button must use the consumer theme',
  );
  assert(
    state.endIcon && state.fontLoaded && Math.abs(state.ligatureWidth - 24) < 1,
    'Icon font/ligature missing',
  );
  assert.deepEqual(errors, []);
  mkdirSync(join(root, 'dist/package-smoke'), { recursive: true });
  await page.screenshot({
    path: join(root, 'dist/package-smoke/consumer.png'),
    fullPage: true,
  });
  console.log(
    `Package smoke test passed: ${packed.filename}. Consumer retained at ${consumer}`,
  );
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
