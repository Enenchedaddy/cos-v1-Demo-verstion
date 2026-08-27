const REMEMBERED_WORK_EMAIL_KEY = 'cos.remembered-work-email';

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Convenience only: this module intentionally persists an email address, never
 * a password, session, refresh token, or authorization data.
 */
export function loadRememberedWorkEmail(): string {
  const storage = browserStorage();
  if (!storage) return '';
  try {
    return (storage.getItem(REMEMBERED_WORK_EMAIL_KEY) ?? '').trim().toLowerCase();
  } catch {
    return '';
  }
}

export function saveRememberedWorkEmail(email: string, remember: boolean): void {
  const storage = browserStorage();
  if (!storage) return;
  try {
    if (remember) {
      storage.setItem(REMEMBERED_WORK_EMAIL_KEY, email.trim().toLowerCase());
    } else {
      storage.removeItem(REMEMBERED_WORK_EMAIL_KEY);
    }
  } catch {
    // Browsers may block storage in privacy-restricted contexts. Login remains usable.
  }
}
