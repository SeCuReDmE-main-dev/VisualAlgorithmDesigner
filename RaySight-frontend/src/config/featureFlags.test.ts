import { describe, expect, it } from 'vitest';
import { FEATURE_FLAGS, isFeatureEnabled } from './featureFlags';

describe('Gate quarantine feature flags', () => {
  it('enables only an explicit true value', () => {
    expect(isFeatureEnabled('true')).toBe(true);
    expect(isFeatureEnabled(' TRUE ')).toBe(true);
    expect(isFeatureEnabled('false')).toBe(false);
    expect(isFeatureEnabled(undefined)).toBe(false);
  });

  it('keeps every post-Gate-0 surface disabled by default', () => {
    expect(FEATURE_FLAGS).toEqual({
      annexes: false,
      promotion: false,
      terraform: false,
      deployment: false,
    });
  });
});
