import { describe, expect, it } from 'vitest';
import { isContentSocialDemoEnabled } from './repository';

describe('Content & Social demo-mode gate', () => {
  it('requires both a development build and the explicit flag', () => {
    expect(isContentSocialDemoEnabled({ DEV: true, VITE_COS_ALLOW_DEMO: 'true' })).toBe(true);
    expect(isContentSocialDemoEnabled({ DEV: true })).toBe(false);
    expect(isContentSocialDemoEnabled({ DEV: false, VITE_COS_ALLOW_DEMO: 'true' })).toBe(false);
  });
});
