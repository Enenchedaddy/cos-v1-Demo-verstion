import { expect, test } from '@playwright/test';

test('publisher switches authorized company/brand/account context without mixing drafts', async ({ page }) => {
  await page.goto('/e2e/fixtures/social-publisher.html');
  await expect(page.getByRole('heading', { name: 'Social Publisher', exact: true })).toBeVisible();
  await expect(page.getByLabel('Instagram account')).toContainText('@delabs_test');
  await page.getByLabel('Caption', { exact: true }).fill('First company draft');
  await page.getByRole('combobox', { name: 'Company', exact: true }).selectOption({ label: 'Quicks Supplements UK' });
  await expect(page.getByLabel('Instagram account')).toContainText('@quicks_test');
  await expect(page.getByLabel('Instagram account')).not.toContainText('@delabs_test');
  await expect(page.getByLabel('Caption', { exact: true })).toHaveValue('');
  await page.getByText('Existing manual publishing and evidence').click();
  await expect(page.getByText('Existing manual evidence remains accessible.')).toBeVisible();
});

test('approved post queues through the API and renders truthful pending status', async ({ page }) => {
  await page.goto('/e2e/fixtures/social-publisher.html');
  await expect(page.getByLabel('Instagram account')).toContainText('@delabs_test');
  const option = await page.getByRole('combobox', { name: 'Approved post', exact: true }).locator('option').nth(1).getAttribute('value');
  await page.getByRole('combobox', { name: 'Approved post', exact: true }).selectOption(option!);
  await page.getByRole('button', { name: 'Publish now', exact: true }).click();
  await expect(page.getByText('QUEUED', { exact: true })).toBeVisible();
  await expect(page.getByText('PUBLISHED', { exact: true })).toHaveCount(0);
  const request = await page.evaluate(() => (window as any).__publisherTestRequests.find((r: any) => r.action === 'schedule'));
  expect(request).toMatchObject({ immediate: true, timezone: 'Africa/Lagos', version_id: option });
  expect(request.request_id).toMatch(/^[0-9a-f-]{36}$/);
});

test('publisher layout remains usable at all required widths', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/e2e/fixtures/social-publisher.html');
  await expect(page.getByRole('heading', { name: 'Social Publisher', exact: true })).toBeVisible();
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const button = await page.getByRole('button', { name: 'Publish now', exact: true }).boundingBox();
    expect(button?.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({ path: testInfo.outputPath(`publisher-${width}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('image post uses its selected account and approved brief, then opens production review', async ({ page }) => {
  await page.goto('/e2e/fixtures/social-publisher.html');
  await expect(page.getByLabel('Instagram account')).toContainText('@delabs_test');
  const brief = await page.getByRole('combobox', { name: 'Approved brief', exact: true }).locator('option').nth(1).getAttribute('value');
  await page.getByRole('combobox', { name: 'Approved brief', exact: true }).selectOption(brief!);
  await page.getByLabel('Caption', { exact: true }).fill('Approved product image test');
  const jpeg = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1080;
    const context = canvas.getContext('2d')!; context.fillStyle = '#183153'; context.fillRect(0, 0, 1080, 1080);
    return canvas.toDataURL('image/jpeg').split(',')[1];
  });
  await page.getByLabel('JPEG image').setInputFiles({ name: 'publisher-test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(jpeg, 'base64') });
  await page.getByLabel('I confirm this brand has permission to publish this image.').check();
  await page.getByRole('button', { name: 'Create post for review' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__publisherTestRequests.some((r: any) => r.navigation === 'Production Pipeline'))).toBe(true);
  const command = await page.evaluate(() => (window as any).__publisherTestRequests.find((r: any) => r.p_action === 'post.create'));
  expect(command.p_payload).toMatchObject({ brief_id: brief, caption: 'Approved product image test', rights_confirmed: true });
});
