# Rapport de Clôture Phase 1 - Visual Algorithm Designer (VAD)

> **Archive historique.** Ce rapport conserve l'état d'une phase ancienne et peut mentionner des fournisseurs, clés `.env`, modèles, ou formulations de conformité qui ne sont plus le contrat scolaire actuel. La route officielle maintenue est Codex/OpenAI ou Antigravity/Gemini via authentification navigateur, avec fallback local déterministe. Voir `README.md` et `SCHOOL_TOOL_GOVERNANCE.md`.

## 1. Ce qui a été accompli

La Phase 1 a été complétée avec succès, couvrant l'infrastructure de base (M0), le backend (M1), le frontend (M2), le canevas (M3), la bibliothèque de sous-pipelines (M4), l'évaluation (M5), le polissage UX (M6), la sécurité (M7), et le nettoyage de la Phase 10.2 (M10.2).

### 1.1 Infrastructure (M0)
* Les bloqueurs d'environnement (B1-B12) ont été corrigés.
* Les scripts de démarrage ont été ajoutés (`start-dev.ps1`).
* Les configurations de Vite (`vite.config.ts`), `package.json` et le proxy API ont été mises à jour.
* Le code mort (`src` à la racine, etc.) a été supprimé.

### 1.2 Backend (M1)
* Les points de terminaison `POST /api/ai/explain-pipeline`, `POST /api/ai/evaluate-pipeline`, `POST /api/memory/feedback` et `GET /api/health` sont implémentés.
* Le service d'IA (`aiPipelineService.js`) intègre un mécanisme de détection de boucles et de limitation.
* La mémoire SQLite BM25 (`sqliteMemoryRepository.js`) est implémentée pour garder le contexte d'apprentissage.
* Limitation du nombre de requêtes configurée via `express-rate-limit`.

### 1.3 Frontend Foundation et Canevas (M2-M4)
* Le shell a 3 colonnes (`AlgorithmDesignerPage.tsx`) est fonctionnel avec le panneau gauche (`AlgorithmPalette.tsx`), le centre (`AlgorithmCanvas.tsx`) et le panneau de propriétés (`AlgorithmPropertiesPanel.tsx`).
* Le drag-and-drop a été implémenté avec `@hello-pangea/dnd` et `@xyflow/react`.
* Une palette personnalisée `palette.css` est utilisée, et les violations de styles en ligne ont été nettoyées.
* La bibliothèque `SubpipelineLibraryPanel.tsx` a été intégrée pour le drag de sous-pipelines complets.

### 1.4 Évaluation, Promotion et UX (M5-M6)
* Le bouton "Expliquer" renvoie une explication formatée par l'IA de l'état actuel de l'algorithme.
* L'évaluation de l'algorithme détermine un score de cohérence.
* La promotion de l'algorithme a été implémentée avec succès (une erreur de test dans `validatedAlgorithmCatalog.test.ts` a d'ailleurs été corrigée pour certifier la logique de validation et de persistance localStorage).
* Le système d'export Excel (`workbookExporter.ts` avec SheetJS) est en place pour documenter les plages de paramètres.
* Les raccourcis clavier (`useKeyboardShortcuts.ts`) et les étapes du tutoriel (`TutorialOverlay.tsx`) ont été implémentés.

### 1.5 Sécurité, Conformité et Session Mode (M7 et 10.2)
* Sept profils de sécurité (educational, general, integrity, compliance, etc.) sont inclus (`securityProfileCatalog.ts`).
* Une option "Session Mode" (Playground vs Workbench) a été rajoutée en fin de cycle (F76-F82), incluant `useSessionMode.ts`, `playgroundCatalog.ts` et `ModeSelectionDialog.tsx`.
* Un rapport de conformité ÉFVP (`complianceReportGenerator.ts`) est généré via la Web Crypto API pour documenter l'architecture.

## 2. Ce qui n'a pas été fait ou nécessite d'être amélioré (Phase 11+)

Malgré les jalons terminés, quelques problèmes et limites persistent, qui devront être adressés ultérieurement :

### 2.1 Backend / Intégration AI
* La latence du service Groq (spécialement en "cold start") n'a pas de timeout robuste côté frontend (`AbortController` recommandé).
* Le frontend ne possède pas de "skeleton loader" approprié pour mitiger l'attente pendant cette latence AI.
* La détection d'abus contextuelle dans l'IA pourrait nécessiter plus de tests approfondis (Tenebris / exceptions).

### 2.2 Frontend / UX
* Dans `workbookExporter.ts`, les noms des feuilles Excel générées ne correspondent pas exactement à la spécification (ils utilisent `{label} summary` au lieu de `Paramètres H2O`).
* Le canevas ReactFlow n'est pas complètement adaptatif (responsive) pour des écrans de moins de 375px. Un travail spécifique sur les `breakpoints` est requis pour le mode mobile.
* Un composant "stub" de phase 2, `VocabularyBridge.tsx`, reste vide et demande une véritable implémentation.
* Le code contient encore quelques erreurs ESLint (type `any`, unused vars) qui nécessiteront une passe de nettoyage en Phase 12.

### 2.3 Tests et Assurance Qualité
* Bien qu'une correction sur `validatedAlgorithmCatalog.test.ts` ait été appliquée pour restaurer les tests à 100%, l'environnement de test Vitest manque de déclarations globales propres pour ses fonctions (`describe`, `it`, `vi`), ce qui génère des erreurs TS en mode `--noEmit`.

### 2.4 Infrastructure et Déploiement
* Le projet reste uniquement fonctionnel en environnement local (localhost).
* Il n'y a pas encore d'intégration continue (CI/CD) ni de configuration de déploiement en production (HTTPS, conteneurs Docker définitifs).
* Le fichier `README.md` définitif et le "runbook" d'opérateur n'ont pas encore été complétés avec les informations de production.
