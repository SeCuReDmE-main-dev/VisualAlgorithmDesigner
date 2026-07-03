/**
 * VocabularyBridge.tsx — F82
 * Plan reference: Phase 8-3.2
 *
 * Phase 1 stub — renders null.
 *
 * Phase 2 intent:
 *   After a user places a node in playground mode, show a contextual callout:
 *   "Tu viens d'utiliser un State Machine. C'est la même logique que les
 *    feux de circulation 🚦"
 *   → Bridges friendly playground vocabulary to technical workbench labels,
 *     progressively building mental models without overwhelming beginners.
 *
 * Phase 2 implementation notes:
 *   - Triggered by AlgorithmCanvas onNodeClick in playground mode only
 *   - Reads PLAYGROUND_CATALOG.find(e => e.algorithmId === algorithmId)
 *   - Renders as a MUI Tooltip or Popover anchored to the target node
 *   - Dismiss on second click or after 5 s (configurable via sessionConfig)
 */

export interface VocabularyBridgeProps {
  algorithmId: string;
  sessionMode?: 'playground' | 'workbench';
}

export function VocabularyBridge(_props: VocabularyBridgeProps): null {
  return null;
}

export default VocabularyBridge;
