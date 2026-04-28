/**
 * playgroundCatalog.ts — F77
 * Plan reference: Phase 8-3.2
 *
 * 8 playground-ready algorithm entries bridging friendly labels (playground)
 * to technical vocabulary (workbench).
 *
 * Each entry maps to an existing algorithmId in algorithmCatalog.ts so the
 * canvas can instantiate real nodes when a user drops a playground card.
 */

import type { PlaygroundCatalogKey } from '../hooks/useSessionMode';

export interface PlaygroundEntry {
  /** Key used in SessionConfig.catalogFilter */
  id: PlaygroundCatalogKey;
  /** Label shown in playground mode */
  friendlyLabel: string;
  /** Label shown in workbench mode / algorithm palette tooltip */
  technicalLabel: string;
  /** Relatable real-world analogy for the tooltip */
  realWorldExample: string;
  /** Maps to ALGORITHM_CATALOG entry for actual node instantiation */
  algorithmId: string;
  /** Palette category colour token (from palette.css node type colours) */
  categoryColor: string;
}

export const PLAYGROUND_CATALOG: PlaygroundEntry[] = [
  {
    id: 'if-then-gate',
    friendlyLabel: 'Si / Alors',
    technicalLabel: 'State Machine',
    realWorldExample: 'Si pluie → prendre parapluie',
    algorithmId: 'gbm',
    categoryColor: 'var(--color-node-classification)',
  },
  {
    id: 'counter-loop',
    friendlyLabel: 'Répéter N fois',
    technicalLabel: 'Counter / Accumulator',
    realWorldExample: 'Points de vie dans un jeu vidéo',
    algorithmId: 'glm',
    categoryColor: 'var(--color-node-regression)',
  },
  {
    id: 'score-tracker',
    friendlyLabel: 'Suivre un score',
    technicalLabel: 'Accumulator',
    realWorldExample: 'Compteur de visites sur une page',
    algorithmId: 'glm',
    categoryColor: 'var(--color-node-regression)',
  },
  {
    id: 'behavior-trigger',
    friendlyLabel: 'Si condition → action',
    technicalLabel: 'Behavior Tree',
    realWorldExample: 'PNJ qui attaque si le joueur s\'approche',
    algorithmId: 'gbm',
    categoryColor: 'var(--color-node-classification)',
  },
  {
    id: 'traffic-light-sequence',
    friendlyLabel: 'Séquence de feux',
    technicalLabel: 'State Machine',
    realWorldExample: 'Feu de circulation rouge → orange → vert',
    algorithmId: 'gbm',
    categoryColor: 'var(--color-node-classification)',
  },
  {
    id: 'random-choice',
    friendlyLabel: 'Choisir au hasard',
    technicalLabel: 'Random Selector',
    realWorldExample: 'Loot drop dans un jeu (épée, potion ou rien)',
    algorithmId: 'xgboost',
    categoryColor: 'var(--color-node-ensemble)',
  },
  {
    id: 'feedback-loop',
    friendlyLabel: 'Répétition adaptative',
    technicalLabel: 'Feedback Loop',
    realWorldExample: 'Thermostat : trop froid → chauffe → éteint',
    algorithmId: 'glm',
    categoryColor: 'var(--color-node-regression)',
  },
  {
    id: 'filter-pipeline',
    friendlyLabel: 'Tri par règle',
    technicalLabel: 'Filter Pipeline',
    realWorldExample: 'Trier les ennemis par distance de proximité',
    algorithmId: 'gbm',
    categoryColor: 'var(--color-node-classification)',
  },
];

