const SUPPORTED_CONFIRMATION_TYPES = new Set(['invite', 'recovery']);

/**
 * Validates the non-consumable values sent to COS's confirmation page. The
 * one-time token hash is only exchanged with Supabase after a person presses
 * the confirmation control in the browser.
 */
export function getConfirmationToken(params: URLSearchParams): { tokenHash: string; type: 'invite' | 'recovery' } | null {
  const tokenHash = params.get('token_hash');
  const type = params.get('type');

  if (!tokenHash || !type || !SUPPORTED_CONFIRMATION_TYPES.has(type)) return null;
  return { tokenHash, type: type as 'invite' | 'recovery' };
}
