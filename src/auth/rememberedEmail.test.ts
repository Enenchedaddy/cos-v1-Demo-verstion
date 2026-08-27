import { afterEach, describe, expect, it } from 'vitest';
import { loadRememberedWorkEmail, saveRememberedWorkEmail } from './rememberedEmail';

const STORAGE_KEY = 'cos.remembered-work-email';

afterEach(() => window.localStorage.clear());

describe('remembered work email', () => {
  it('persists only the normalized email when the user opts in', () => {
    saveRememberedWorkEmail(' Jeremiah@Example.com ', true);

    expect(loadRememberedWorkEmail()).toBe('jeremiah@example.com');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('jeremiah@example.com');
  });

  it('removes the remembered email when the user opts out', () => {
    saveRememberedWorkEmail('jeremiah@example.com', true);
    saveRememberedWorkEmail('jeremiah@example.com', false);

    expect(loadRememberedWorkEmail()).toBe('');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
