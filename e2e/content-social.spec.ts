import { expect, test } from '@playwright/test';

const browserErrors = new WeakMap<object, string[]>();

test.beforeEach(async ({ page }, testInfo) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cos-portal-initialized', 'true');
    window.localStorage.clear();
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Authenticate and enter Sales & Marketing Platform' }).click();
  const contentArea = testInfo.project.name === 'mobile-chromium'
    ? page.getByLabel('Content & Social')
    : page.getByLabel('Sales and Marketing modules').getByRole('button', { name: 'Content & Social', exact: true });
  await contentArea.waitFor();
  await contentArea.click();
});

test('opens the unified Content & Social workspace and creates a governed idea', async ({ page }, testInfo) => {
  await expect(page.getByRole('heading', { name: 'Content operations at a glance' })).toBeVisible();
  if (process.env.COS_CAPTURE === '1') {
    await page.screenshot({ path: `test-results/content-social-overview-${testInfo.project.name}.png`, fullPage: true });
  }
  if (testInfo.project.name === 'mobile-chromium') {
    await page.getByLabel('Content & Social area').selectOption('Planning & Briefs');
  } else {
    await page.getByRole('button', { name: 'Planning & Briefs' }).click();
  }
  await page.getByRole('button', { name: 'New idea' }).click();
  await page.getByLabel('Idea title').fill('Customer evidence explainer');
  await page.getByLabel('Summary').fill('Turn the latest delivery evidence into a concise social explainer.');
  await page.getByRole('button', { name: 'Create idea' }).click();
  await expect(page.getByText('Customer evidence explainer')).toBeVisible();
  await expect(page.getByText(/idea converted|change recorded|governed content idea/i).first()).toBeVisible();
  expect(testInfo.errors).toHaveLength(0);
  expect(browserErrors.get(page)).toEqual([]);
});

test('exposes a usable mobile route selector without a duplicate navigation drawer', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Responsive-only assertion.');
  await expect(page.getByLabel('Content & Social area')).toBeVisible();
  await page.getByLabel('Content & Social area').selectOption('Performance');
  await expect(page.getByRole('heading', { name: /measure with explicit source confidence/i })).toBeVisible();
  await expect(page.locator('[role="dialog"]')).toHaveCount(0);
});

test('keeps the title-bar scale and canvas stable at COS breakpoints', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'One browser can exercise all CSS breakpoints.');
  const title = page.getByRole('heading', { name: 'Content operations at a glance' });
  await expect(title).toHaveCSS('font-family', /Montserrat/);
  await expect(page.locator('body')).toHaveCSS('font-family', /Inter/);
  await expect(page.locator('.font-tabular-nums').first()).toHaveCSS('font-family', /JetBrains Mono/);
  const expectations = [
    { width: 375, height: 812, fontSize: '18px' },
    { width: 768, height: 900, fontSize: '20px' },
    { width: 1024, height: 900, fontSize: '24px' },
    { width: 1440, height: 900, fontSize: '24px' },
  ];

  for (const viewport of expectations) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS('font-size', viewport.fontSize);
    if (process.env.COS_CAPTURE === '1') {
      await page.screenshot({ path: `test-results/titlebar-${viewport.width}.png`, fullPage: false });
    }
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      topbarHeight: document.querySelector('.cos-global-topbar')?.getBoundingClientRect().height ?? 0,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.topbarHeight).toBeGreaterThanOrEqual(64);
  }
});
