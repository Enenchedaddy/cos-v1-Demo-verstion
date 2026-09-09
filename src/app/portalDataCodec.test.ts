import { describe, expect, it } from 'vitest';
import { fromPortalDatabase, toPortalDatabase } from './portalDataCodec';

describe('legacy portal database codec', () => {
  it('maps top-level and JSONB keys to PostgreSQL snake_case', () => {
    expect(toPortalDatabase({
      customerNumber: 'CUST-1',
      billingAddress: { postalCode: 'SW1A 1AA' },
      deliveryAddresses: [{ isDefault: true }],
    })).toEqual({
      customer_number: 'CUST-1',
      billing_address: { postal_code: 'SW1A 1AA' },
      delivery_addresses: [{ is_default: true }],
    });
  });

  it('restores application keys from Data API rows', () => {
    expect(fromPortalDatabase({
      order_number: 'ORD-1',
      credit_hold_triggered: true,
      items: [{ unit_price: 20 }],
    })).toEqual({
      orderNumber: 'ORD-1',
      creditHoldTriggered: true,
      items: [{ unitPrice: 20 }],
    });
  });
});
