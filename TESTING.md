# Testing Standard & Protocol: B2B Gas Cylinder Corporate Operating System (COS)

This document establishes the official QA testing standard for the COS platform, designed to verify operational compliance, financial gatekeeping, and cross-border integrity.

---

## 1. Key Verification Objectives (The "Core Aim")

The main purpose of this application is to ensure **safe cross-border cylinder track-and-trace operations** alongside **strict transfer pricing, credit limits, and CEO approvals governance**. 

The testing strategy must prove:
1. **Operational Traceability:** Cylinder balances update accurately as statuses shift between *Full On-Site*, *In Transit*, and *Empty Return*.
2. **Financial Gatekeeping:** Credit limits block or route transactions to CEO approval when exceeded.
3. **Audit & Compliance Logs:** Every cross-entity trade or compliance state change creates an immutable, timestamped log under the CO-10 framework.
4. **Global Query Indexing:** Search inputs across Sales, Marketing, and Management immediately filter records without visual page flicker.

---

## 2. Automated Testing Suite Standard

We recommend a two-tier automated testing strategy using modern, type-safe frameworks:

### Tier A: End-to-End (E2E) Browser Flows (Playwright)
Verify real user workflows across platforms (Sales, Marketing, Management) and guarantee iframe sandboxing compatibility.

```typescript
// tests/compliance-gatekeeping.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Transfer Pricing & Credit Gatekeeping Workflow', () => {
  test('Should block trade and trigger CEO exception when order exceeds credit limit', async ({ page }) => {
    // 1. Log in as Sales Agent
    await page.goto('/gateway');
    await page.click('text=Sales and Operations');

    // 2. Select a customer near their limit
    await page.click('text=Northwind Industrial Ltd');
    await page.click('text=New Order');

    // 3. Place order exceeding available credit
    await page.fill('[placeholder="Cylinder Quantity"]', '150');
    await page.click('text=Submit Order');

    // 4. Verify system blocks and triggers approval modal
    await expect(page.locator('text=Credit Hold Exception Raised')).toBeVisible();

    // 5. Switch to Management Platform to confirm CEO Approval exception is pending
    await page.goto('/gateway');
    await page.click('text=Group Management');
    await page.click('text=CEO Board');
    await expect(page.locator('text=Northwind Industrial Ltd')).toContainText('Pending CEO Review');
  });
});
```

### Tier B: Unit & Component Isolation Tests (Vitest + React Testing Library)
Verify that local state memoization, search filter pipelines, and math formulas run with 100% precision.

```typescript
// src/components/__tests__/SearchPipeline.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SalesPlatform from '../SalesPlatform';

describe('Sales Platform Search Indexing Pipeline', () => {
  it('should immediately filter active records matching query', async () => {
    render(<SalesPlatform companies={mockCompanies} deals={mockDeals} ... />);
    
    const searchInput = screen.getByPlaceholderText(/Search records.../i);
    fireEvent.change(searchInput, { target: { value: 'Northwind' } });
    
    // Dropdown results display the company
    expect(await screen.findByText('Northwind Industrial Ltd')).toBeInTheDocument();
  });
});
```

---

## 3. Manual Verification Checklist (Pre-Deployment)

Execute these high-touch verification steps before pushing updates to production:

| Section | Step | Expected Result |
| :--- | :--- | :--- |
| **01. Search** | Type `DELabs` into all search bars in Sales, Marketing, & Management. | Dropdowns must render with customized tags (e.g., Corporate Entity, Partner Account) and jump tabs on selection. |
| **02. Responsive Card Layout** | Resize the viewport to standard iPhone, iPad, and 4K widths. | Text lines must never overlap or wrap awkwardly. Padding scales down proportionally. |
| **03. Credit Limits** | Create an order larger than available credit on a client record. | State switches immediately to 'Blocked / CEO Approval Required'. |
| **04. Compliance** | Perform any administrative or transactional action. | A corresponding entry is automatically injected into the governance console audit ledger. |
