export function isFeatureEnabled(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  return value?.trim().toLowerCase() === 'true';
}

/**
 * Gate -1 quarantine. Every post-Gate-0 surface is opt-in and therefore
 * absent from school builds unless an operator explicitly enables it.
 */
export const FEATURE_FLAGS = Object.freeze({
  annexes: isFeatureEnabled(import.meta.env.VITE_ENABLE_VAD_ANNEXES),
  promotion: isFeatureEnabled(import.meta.env.VITE_ENABLE_VAD_PROMOTION),
  terraform: isFeatureEnabled(import.meta.env.VITE_ENABLE_VAD_TERRAFORM),
  deployment: isFeatureEnabled(import.meta.env.VITE_ENABLE_VAD_DEPLOYMENT),
});
