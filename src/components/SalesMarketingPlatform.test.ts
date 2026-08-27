import { describe, expect, it } from 'vitest';
import {
  getSalesMarketingCapabilities,
  getVisibleSalesMarketingAreas,
  SALES_MARKETING_INTERFACE_VISIBILITY_PERMISSION,
} from './SalesMarketingPlatform';

const salesOnlyAreaIds = ['crm', 'sales-execution', 'commerce'];
const marketingOnlyAreaIds = ['campaigns', 'paid-media', 'lifecycle', 'partnerships'];

function visibleIds(permissions: readonly string[]) {
  return getVisibleSalesMarketingAreas(permissions).map((area) => area.id);
}

function expectFullSalesMarketingNavigation(permissions: readonly string[]) {
  const areas = getVisibleSalesMarketingAreas(permissions);
  expect(areas.map((area) => area.id)).toEqual(expect.arrayContaining([...salesOnlyAreaIds, ...marketingOnlyAreaIds]));
  expect(areas.every((area) => area.groups.length > 0 && area.groups.every((group) => group.routes.length > 0))).toBe(true);
  expect(areas.find((area) => area.id === 'sales-execution')?.routes).toContain('Quotes');
  expect(areas.find((area) => area.id === 'campaigns')?.routes).toContain('Campaign Portfolio');
}

describe('Sales & Marketing module visibility', () => {
  it.each([
    ['CEO', [SALES_MARKETING_INTERFACE_VISIBILITY_PERMISSION]],
    ['MANAGEMENT', [SALES_MARKETING_INTERFACE_VISIBILITY_PERMISSION]],
    ['SOFTWARE_ENGINEER', [SALES_MARKETING_INTERFACE_VISIBILITY_PERMISSION]],
  ])('%s can inspect the complete staging Sales & Marketing navigation structure', (_role, permissions) => {
    expectFullSalesMarketingNavigation(permissions);
    expect(getVisibleSalesMarketingAreas(permissions).find((area) => area.id === 'content-social')?.routes).toContain('Social Publisher');
  });

  it('keeps Sales navigation exclusive to Sales users', () => {
    const areas = visibleIds(['sales.view']);
    expect(areas).toEqual(expect.arrayContaining(salesOnlyAreaIds));
    expect(areas).not.toEqual(expect.arrayContaining(marketingOnlyAreaIds));
  });

  it('keeps Marketing navigation exclusive to Marketing users', () => {
    const areas = visibleIds(['marketing.view']);
    expect(areas).toEqual(expect.arrayContaining(marketingOnlyAreaIds));
    expect(areas).not.toEqual(expect.arrayContaining(salesOnlyAreaIds));
  });

  it('does not turn interface visibility into Sales creation authority', () => {
    expect(getSalesMarketingCapabilities([SALES_MARKETING_INTERFACE_VISIBILITY_PERMISSION])).toMatchObject({
      canViewSales: true,
      canViewMarketing: true,
      canCreateSales: false,
    });
  });

  it('shows Content & Social only through the staging interface capability and keeps Settings hidden', () => {
    expect(visibleIds([SALES_MARKETING_INTERFACE_VISIBILITY_PERMISSION])).toContain('content-social');
    expect(visibleIds([SALES_MARKETING_INTERFACE_VISIBILITY_PERMISSION])).not.toContain('settings');
    expect(visibleIds(['sales.view'])).not.toContain('content-social');
  });
});
