import { expect, test } from '@playwright/test';

const expectedProjectHost = 'bppjneljqonuouleptgs.supabase.co';

test('sends configured login attempts to the intended Supabase Auth endpoint', async ({ page }) => {
  let interceptedAuthRequest = false;

  await page.route('**/auth/v1/token?grant_type=password', async (route) => {
    const request = route.request();
    expect(new URL(request.url()).host).toBe(expectedProjectHost);
    expect(request.method()).toBe('POST');
    interceptedAuthRequest = true;
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'invalid_grant', error_description: 'Controlled browser test response.' }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Work email', { exact: true }).fill('browser-check@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('not-a-real-password');
  await page.getByRole('button', { name: 'Sign in to workspace' }).click();

  await expect.poll(() => interceptedAuthRequest).toBe(true);
  await expect(page.getByText('Authentication is not configured for this environment.')).toHaveCount(0);
  await expect(page.getByText('Unable to sign in with those credentials.')).toBeVisible();
});
