import { describe, expect, it } from 'vitest';
import { getConfirmationToken } from './confirmationUrl';

describe('getConfirmationToken', () => {
  it('accepts a supported invite token hash', () => {
    const params = new URLSearchParams('token_hash=single-use-token&type=invite');

    expect(getConfirmationToken(params)).toEqual({ tokenHash: 'single-use-token', type: 'invite' });
  });

  it('accepts a supported recovery token hash', () => {
    const params = new URLSearchParams('token_hash=single-use-token&type=recovery');

    expect(getConfirmationToken(params)).toEqual({ tokenHash: 'single-use-token', type: 'recovery' });
  });

  it('rejects absent hashes and unsupported confirmation types', () => {
    expect(getConfirmationToken(new URLSearchParams('type=recovery'))).toBeNull();
    expect(getConfirmationToken(new URLSearchParams('token_hash=single-use-token&type=magiclink'))).toBeNull();
  });
});
