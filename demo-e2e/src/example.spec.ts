import { test, expect } from '@playwright/test';

test('home page links to the Button documentation', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Angular components, forged for real products.',
    }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Explore Button', exact: true }).click();
  await expect(page).toHaveURL(/\/components\/button$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Button', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('combobox', { name: 'Variant', exact: true }),
  ).toBeVisible();
});

test.describe('Button playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/button');
  });

  for (const [label, attribute, values] of [
    [
      'Variant',
      'data-variant',
      ['text', 'elevated', 'outlined', 'filled', 'tonal', 'icon'],
    ],
    ['Size', 'data-size', ['sm', 'md', 'lg']],
    ['Color', 'data-color', ['primary', 'secondary', 'tertiary', 'error']],
  ] as const) {
    test(`changing ${label.toLowerCase()} updates the live preview and code`, async ({
      page,
    }) => {
      const preview = page.locator('app-example-card').filter({
        has: page.getByRole('heading', {
          level: 3,
          name: 'Preview',
          exact: true,
        }),
      });
      const control = page.getByRole('combobox', { name: label, exact: true });
      const button = preview.getByRole('button', { name: 'Save', exact: true });
      await preview.getByRole('button', { name: 'Show code', exact: true }).click();
      for (const value of values) {
        await control.click();
        await page.getByRole('option', { name: value, exact: true }).click();
        await expect(control).toHaveText(value);
        await expect(preview.locator('forge-button')).toHaveAttribute(
          attribute,
          value,
        );
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
        await expect(preview.locator('pre')).toContainText(
          `${label.toLowerCase()}="${value}"`,
        );
      }
    });
  }

  test('loading and disabled independently block and restore the button', async ({
    page,
  }) => {
    const preview = page.locator('app-example-card').filter({
      has: page.getByRole('heading', {
        level: 3,
        name: 'Preview',
        exact: true,
      }),
    });
    const button = preview.getByRole('button', { name: 'Save', exact: true });
    const spinner = preview.getByRole('progressbar');
    const loading = page.getByRole('switch', { name: 'Loading', exact: true });
    const disabled = page.getByRole('switch', {
      name: 'Disabled',
      exact: true,
    });
    await expect(button).toBeEnabled();
    await expect(spinner).toHaveCount(0);
    await loading.click();
    await expect(loading).toBeChecked();
    await expect(button).toBeDisabled();
    await expect(spinner).toBeVisible();
    await disabled.click();
    await expect(disabled).toBeChecked();
    await loading.click();
    await expect(loading).not.toBeChecked();
    await expect(spinner).toHaveCount(0);
    await expect(button).toBeDisabled();
    await disabled.click();
    await expect(disabled).not.toBeChecked();
    await expect(button).toBeEnabled();
    await loading.click();
    await expect(button).toBeDisabled();
    await loading.click();
    await expect(button).toBeEnabled();
    await expect(spinner).toHaveCount(0);
  });
});

test('examples expose multiline code, clipboard actions and permanent links', async ({ page, context, browserName }) => {
  // Firefox and WebKit do not support these clipboard permissions.
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(browserName !== 'chromium', 'Clipboard permissions are tested in Chromium.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/components/button');
  const example = page.locator('#button-icon-placement');
  await expect(example.locator('pre')).toBeHidden();
  await example.getByRole('button', { name: 'Show code', exact: true }).click();
  await expect(example.locator('pre')).toBeVisible();
  const code = await example.locator('code').innerText();
  expect(code.split('\n')).toHaveLength(4);
  expect(code).not.toContain('\\n');
  await example.getByRole('button', { name: 'Copy code', exact: true }).click();
  await expect(example.getByRole('status')).toHaveText('Code copied');
  const copiedCode = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedCode.replace(/\r\n/g, '\n')).toBe(code);
  await example.getByRole('button', { name: 'Copy link to Icon placement', exact: true }).click();
  await expect(example.getByRole('status')).toHaveText('Link copied');
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toBe(new URL('/components/button#button-icon-placement', page.url()).href);
  await example.getByRole('button', { name: 'Hide code', exact: true }).click();
  await expect(example.locator('pre')).toBeHidden();
  await example.getByRole('link', { name: 'Link to Icon placement', exact: true }).click();
  await expect(page).toHaveURL(/\/components\/button#button-icon-placement$/);
  await page.goto('/');
  await page.goto(link);
  await expect(example).toBeInViewport();
  await expect(example.locator('pre')).toBeHidden();
});
