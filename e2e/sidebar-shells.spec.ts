import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('cos-portal-initialized', 'true');
    window.localStorage.clear();
  });
  await page.goto('/');
});

for (const workspace of [
  {
    gatewayLabel: 'Authenticate and enter Sales & Marketing Platform',
    activeArea: 'Home',
    checkAreas: ['Settings & Governance', 'Content & Social'],
    captureName: 'sales-marketing',
  },
  {
    gatewayLabel: 'Authenticate and enter CEO & Management Suite',
    activeArea: 'Command Home',
    checkAreas: ['Performance & Business Units', 'Organisation & Headcount'],
    captureName: 'management',
  },
] as const) {
  test(`${workspace.captureName} uses the shared COS sidebar header`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Contextual sidebar is desktop-only.');

    await page.getByRole('button', { name: workspace.gatewayLabel }).click();
    const contextHeader = page.getByTestId('cos-context-rail-header');
    await expect(contextHeader).toBeVisible();
    await expect(contextHeader.getByText('Central Operating System')).toBeVisible();
    await expect(contextHeader.getByText(workspace.activeArea, { exact: true })).toBeVisible();
    await expect(page.getByTestId('cos-rail-brand')).toBeVisible();
    await expect(page.getByTestId('cos-rail-brand-divider')).toBeVisible();
    await expect(contextHeader).toHaveCSS('height', '90px');

    for (const area of workspace.checkAreas) {
      await page.getByRole('button', { name: area, exact: true }).click();
      const title = page.getByTestId('cos-context-rail-title');
      await expect(title).toHaveText(area);
      const fits = await title.evaluate((element) => {
        const titleRect = element.getBoundingClientRect();
        const headerRect = element.closest('header')?.getBoundingClientRect();
        return Boolean(headerRect && titleRect.right <= headerRect.right && titleRect.bottom <= headerRect.bottom);
      });
      expect(fits).toBe(true);
    }

    if (process.env.COS_CAPTURE === '1') {
      await page.screenshot({ path: `test-results/sidebar-${workspace.captureName}.png`, fullPage: false });
    }
  });
}
