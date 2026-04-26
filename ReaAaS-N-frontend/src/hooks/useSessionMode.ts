/**
 * useSessionMode.ts — F76
 * Plan reference: Phase 8-3.2
 *
 * Phase 1 stub: two session modes (playground vs workbench).
 * Persists to localStorage['vad_session_mode'].
 *
 * Phase 2 expansion plan:
 *   - Playground: score as stars, PDF export, Scratch integration, challenge of the day
 *   - Workbench: auth (magic link), pipeline versioning, team dashboard, webhook integration
 */

import { useCallback, useState } from 'react';
import type { SecurityProfileId } from '../services/securityProfileCatalog';

export type SessionMode = 'playground' | 'workbench';

export type PlaygroundCatalogKey =
  | 'if-then-gate'
  | 'counter-loop'
  | 'score-tracker'
  | 'behavior-trigger'
  | 'traffic-light-sequence'
  | 'random-choice'
  | 'feedback-loop'
  | 'filter-pipeline';

export interface PlaygroundConfig {
  mode: 'playground';
  displayName: string;
  validationProfile: 'educational';
  catalogFilter: PlaygroundCatalogKey[];
  vocabularyMode: 'friendly';
  /** Phase 2: switch to 'stars' */
  showScoreAs: 'percent';
  tutorialForced: true;
  allowExport: false;
}

export interface WorkbenchConfig {
  mode: 'workbench';
  securityProfile: SecurityProfileId;
  validationThreshold: number;
  requiresAuditLog: boolean;
  allowComplianceReport: boolean;
  vocabularyMode: 'technical';
  showScoreAs: 'percent';
  tutorialForced: false;
  allowExport: true;
}

export type SessionConfig = PlaygroundConfig | WorkbenchConfig;

const SESSION_MODE_KEY = 'vad_session_mode';

const DEFAULT_PLAYGROUND_CATALOG: PlaygroundCatalogKey[] = [
  'if-then-gate',
  'counter-loop',
  'score-tracker',
  'behavior-trigger',
  'traffic-light-sequence',
  'random-choice',
  'feedback-loop',
  'filter-pipeline',
];

// Phase 1: security profile thresholds are resolved locally to avoid coupling.
// Phase 2: import dynamically from securityProfileCatalog.
const PROFILE_THRESHOLDS: Record<SecurityProfileId, { threshold: number; requiresAuditLog: boolean }> = {
  general:      { threshold: 93, requiresAuditLog: false },
  educational:  { threshold: 70, requiresAuditLog: false },
  integrity:    { threshold: 97, requiresAuditLog: true  },
  compliance:   { threshold: 95, requiresAuditLog: true  },
  security:     { threshold: 95, requiresAuditLog: true  },
  research:     { threshold: 90, requiresAuditLog: false },
  operations:   { threshold: 93, requiresAuditLog: true  },
};

export function initPlaygroundSession(): PlaygroundConfig {
  const config: PlaygroundConfig = {
    mode: 'playground',
    displayName: 'Mon premier algorithme',
    validationProfile: 'educational',
    catalogFilter: DEFAULT_PLAYGROUND_CATALOG,
    vocabularyMode: 'friendly',
    showScoreAs: 'percent',
    tutorialForced: true,
    allowExport: false,
  };
  try {
    localStorage.setItem(SESSION_MODE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors in restricted environments
  }
  return config;
}

export function initWorkbenchSession(securityProfile: SecurityProfileId = 'general'): WorkbenchConfig {
  const profileSettings = PROFILE_THRESHOLDS[securityProfile] ?? PROFILE_THRESHOLDS.general;
  const config: WorkbenchConfig = {
    mode: 'workbench',
    securityProfile,
    validationThreshold: profileSettings.threshold,
    requiresAuditLog: profileSettings.requiresAuditLog,
    allowComplianceReport: securityProfile === 'compliance',
    vocabularyMode: 'technical',
    showScoreAs: 'percent',
    tutorialForced: false,
    allowExport: true,
  };
  try {
    localStorage.setItem(SESSION_MODE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
  return config;
}

function loadPersistedConfig(): SessionConfig {
  try {
    const raw = localStorage.getItem(SESSION_MODE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionConfig;
      if (parsed.mode === 'playground' || parsed.mode === 'workbench') {
        return parsed;
      }
    }
  } catch {
    // Fall through to default
  }
  // Default: workbench general — existing users are not disrupted
  return initWorkbenchSession('general');
}

/**
 * useSessionMode
 *
 * React hook that reads/persists the session configuration.
 * Returns the current config + two switch functions.
 *
 * Usage in App.tsx:
 *   const { config, switchToPlayground, switchToWorkbench } = useSessionMode();
 */
export function useSessionMode() {
  const [config, setConfig] = useState<SessionConfig>(loadPersistedConfig);

  const switchToPlayground = useCallback(() => {
    setConfig(initPlaygroundSession());
  }, []);

  const switchToWorkbench = useCallback((profile: SecurityProfileId = 'general') => {
    setConfig(initWorkbenchSession(profile));
  }, []);

  return { config, switchToPlayground, switchToWorkbench };
}
