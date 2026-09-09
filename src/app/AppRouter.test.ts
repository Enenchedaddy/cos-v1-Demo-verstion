import { describe, expect, it } from 'vitest';
import { resolveClientApprovalToken } from './AppRouter';

describe('public client approval routing', () => {
  it('accepts the canonical token query parameter', () => {
    expect(resolveClientApprovalToken('?token=approval-token')).toBe('approval-token');
  });

  it('keeps existing generated links compatible', () => {
    expect(resolveClientApprovalToken('?client_approval=legacy-token')).toBe('legacy-token');
  });
});
