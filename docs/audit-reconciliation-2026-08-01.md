# Réconciliation des audits VAD — 2026-08-01

Source de vérité: checkout local `VisualAlgorithmDesigner` à `cfcbc6fd41c0b8c22a14a8328e883c5bc99a0e9a` avec modifications non commitées préservées.

| Affirmation | Verdict frais | Preuve locale |
|---|---|---|
| VAD ne contient aucun frontend | Fausse | `RaySight-frontend/src`, React 19 et Vite 7 existent. |
| Aucun `SpatialCanvas` | Fausse | `src/components/SpatialCanvas.tsx` est le composant canonique importé par `AlgorithmCanvas`. |
| Playwright absent | Fausse | `playwright.config.ts`, scripts E2E et projets Chromium/Firefox/WebKit existent. |
| `PortDescriptorV1` absent | Fausse | Le contrat et sa validation résident dans `src/services/graphPorts.ts`. |
| Gate 0 entièrement fermée | Périmée | La preuve antérieure était verte, mais l'interface courante échoue sur le scénario prefab et les essais physiques manquent. |
| Annexes développées avant fermeture Gate 0 | Vraie | H2O, RaySight, Supabase et CodeProject.AI sont présents; ils sont maintenant préservés derrière des flags désactivés. |
| Contrats Gate 1 complets | Fausse | `PipelineDocumentV2`, `ExecutionPlanV1` et `ExecutionEventV1` ne sont pas encore implémentés. |
| Score 93 encore codé dans plusieurs modules | Vraie | VAD et Algorithm Builder contiennent des seuils et valeurs 93; ils restent gelés jusqu'à Gate 4. |
| Le véritable audit du 29 juillet disait « aucun frontend » | Fausse | Le fichier `audit globlal/VisualAlgorithmDesigner/audit_report.md` décrit explicitement React et le DnD. |

Décision: ne rien jeter. Réouvrir Gate 0, masquer les surfaces postérieures et ne reprendre Gate 1 qu'après preuves automatisées et matérielles fraîches.
