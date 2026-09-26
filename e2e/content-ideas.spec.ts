import { expect, test, type Page } from '@playwright/test';

async function openIdea(page: Page) {
  await page.goto('/e2e/fixtures/content-ideas.html');
  await page.getByRole('button', { name: 'New idea', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Idea title').fill('New brand campaign');
  await dialog.getByLabel('Summary').fill('Draft content for the selected brand.');
  await dialog.getByLabel('Owner').fill('Test planner');
  return dialog;
}

test('brand selection preserves the draft and saves both idea and audit to the selected company', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const dialog = await openIdea(page);
  const brands = dialog.getByRole('combobox', { name: 'Brand', exact: true });
  await expect(brands.getByRole('option', { name: 'Test company A — Brand Alpha' })).toHaveCount(1);
  await expect(brands.getByRole('option', { name: 'Test company B — Brand Beta' })).toHaveCount(1);
  await expect(brands.getByRole('option', { name: /Read-only brand/ })).toHaveJSProperty('disabled', true);
  await brands.selectOption({ label: 'Test company B — Brand Beta' });
  await expect(dialog.getByLabel('Idea title')).toHaveValue('New brand campaign');
  await dialog.getByRole('button', { name: 'Create idea', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Company', exact: true })).toHaveValue('82000000-0000-4000-8000-000000000020');
  await expect(page.getByRole('combobox', { name: 'Brand', exact: true })).toHaveValue('82000000-0000-4000-8000-000000000021');
  await expect(page.getByText('New brand campaign', { exact: true })).toBeVisible();
  const saved = await page.evaluate(() => (window as any).__ideaTestRows);
  expect(saved.cs_ideas).toHaveLength(1);
  expect(saved.cs_ideas[0]).toMatchObject({ client_id: '82000000-0000-4000-8000-000000000020', brand_id: '82000000-0000-4000-8000-000000000021' });
  const audit = saved.cs_audit_events.find((row: any) => row.target_id === saved.cs_ideas[0].id);
  expect(audit).toMatchObject({ client_id: saved.cs_ideas[0].client_id, brand_id: saved.cs_ideas[0].brand_id });
  expect(audit).not.toHaveProperty('brand_name');
  await page.getByRole('combobox', { name: 'Company', exact: true }).selectOption({ label: 'Test company A' });
  await expect(page.getByText('New brand campaign', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('retry after a partial audit failure does not duplicate the idea', async ({ page }) => {
  const dialog = await openIdea(page);
  await page.evaluate(() => { (window as any).__failNextAudit = true; });
  await dialog.getByRole('button', { name: 'Create idea', exact: true }).click();
  await expect(dialog.getByText('Temporary audit failure')).toBeVisible();
  await expect(dialog.getByLabel('Idea title')).toHaveValue('New brand campaign');
  await dialog.getByRole('button', { name: 'Create idea', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__ideaTestRows.cs_ideas.length)).toBe(1);
});

test('idea dialog fits the required mobile and desktop widths', async ({ page }, testInfo) => {
  const dialog = await openIdea(page);
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(dialog.getByRole('combobox', { name: 'Brand', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const button = await dialog.getByRole('button', { name: 'Create idea', exact: true }).boundingBox();
    expect(button?.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: testInfo.outputPath(`idea-${width}.png`), fullPage: true });
  }
});

test('idea dialog keeps its header and submit button reachable on a short mobile screen', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/e2e/fixtures/content-ideas.html');
  await page.getByRole('button', { name: 'New idea', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Capture content idea' })).toBeInViewport();
  await expect(dialog.getByRole('combobox', { name: 'Brand', exact: true })).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath('idea-short-mobile-top.png') });
  const submit = dialog.getByRole('button', { name: 'Create idea', exact: true });
  await submit.scrollIntoViewIfNeeded();
  await expect(submit).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath('idea-short-mobile-bottom.png') });
});
