import { expect, test } from '@playwright/test';

test('keeps token-based client approval outside the authenticated app shell', async ({ page }) => {
  await page.goto('/client-approval?token=invalid-e2e-token');
  await expect(page.getByText('Secure client approval')).toBeVisible();
  await expect(page).toHaveURL(/\/client-approval\?token=/);
  await expect(page.getByText('Approval unavailable')).toBeVisible();
});
