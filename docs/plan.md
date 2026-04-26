# VAD — VisualAlgorithmDesigner (ReaAaS-N)
# Dossier Architecte-Zero — Sessions 1 à 6
# Branche: PaQBoT | Repo: SeCuReDmE-main-dev/VisualAlgorithmDesigner
# Dernière mise à jour: 26 avril 2026

---

## PHASE 1 — az-research-brainstorm-design

### Idée de départ
App educative pour visualiser et construire des algorithmes visuellement.
Deux projets existants fusionnés :
- VisualAlgorithmDesigner (ReaAaS-N) — React 18 + Vite + MUI + ReactFlow
- algorithm-builder-app — Express + PostgreSQL + Redis + JWT

### Mécanisme productisable retenu
construction visuelle d'étapes (drag-drop)
→ exécution pas-à-pas avec état visible
→ explication AI de l'état à une étape précise

### MVP Principal
AI Tutor sur algorithme créé par l'utilisateur — pas un exemple figé.

### MVP Backup
Circuit Designer comme outil logique pour étudiants en génie électrique (EE).

### Feature Graveyard Phase 1
- QuaNTecH (quantum gates, Bloch sphere) — Phase 4
- MindsDB — CUT définitif
- LangChain — CUT (remplacé groq-sdk)
- Authentification, paiements, multi-user — Phase 3
- Neutrosophique, quantum, AlphaTensor — Phase 4+

### Plan de validation 7 jours
- Jour 1-2 : Fix 8 blockers + npm install fonctionnel
- Jour 3-4 : POST /api/ai/explain + bouton câblé
- Jour 5 : Colab badge + Share to Classroom
- Jour 6 : Déploiement Azure Free/Students
- Jour 7 : Post r/learnprogramming + DM 5 profs CS

---

## PHASE 2 — az-market-viability-app-research

### Verdict : GO — Fenêtre de 6 mois

Signal critique (source primaire, 26 avril 2026) :
> "The focus for 2026 expansion project is to explore new Information Visualization
> techniques, perhaps AI-assisted." — VisuAlgo.net (financé par Optiver)

VisuAlgo a nommé notre angle sans l'avoir construit.

### Comparateurs analysés (10, sources primaires)

| Outil | Prix | Crée algos? | AI tutor? | Gap exploitable |
|-------|------|-------------|-----------|-----------------|
| VisuAlgo | Gratuit | Non | Annoncé 2026 | AI + création |
| Algorithm Visualizer | Gratuit | Via code | Non | Drag-drop + AI |
| Codecademy | $0-25 CAD/mo | Non | Partiel | Trop large |
| Educative | $13-24 CAD/mo | Non | Code feedback | Pas visuel |
| LeetCode | $14.92-35 USD/mo | Non | Ask Leet | Interview only |
| Replit | $0-90/mo | Via IDE | Oui | IDE, pas visuel |
| Flowgorithm | Gratuit | Flowchart | Non | Desktop, no AI |

### Matrice de Viabilité : 25/35 → GO

| Critère | Score /5 |
|---------|----------|
| Urgence de la douleur | 4 |
| Volonté de payer | 3 |
| Saturation concurrentielle | 3 |
| Difficulté technique solo | 2 |
| Canal acquisition réaliste | 4 |
| Opportunité de différenciation | 5 |
| Faisabilité MVP 7-30j | 4 |

### Route de Revenus
- Mois 1-3 : Gratuit → validation usage
- Mois 3-6 : $8 CAD/mo étudiant → 20 payants = $160/mo
- Mois 6-12 : $15 CAD/mo enseignant → 10 profs = $150/mo
- Mois 12+ : $50-100 CAD/mo/école → 5 écoles = $250-500/mo

---

## PHASE 3 — az-singularity

### Core Loop Verrouillé

```
INPUT  → Séquence d'étapes créée par l'utilisateur
         + valeurs d'entrée concrètes [5, 3, 8, 1]
         + bouton "Explain step 3"

MOTEUR → Step runner (existant dans AlgorithmBuilderPage)
         + prompt contextuel → groq-sdk → llama-3.1-8b-instant

OUTPUT → "À l'étape 3, ton algo compare 5 et 3.
          Comme 5 > 3, il les échange.
          C'est pourquoi ton tableau est [3, 5, 8, 1]."
```

### Loi Fondamentale Unique
L'app est utile UNIQUEMENT parce qu'elle explique l'état d'exécution
de l'algorithme que TU as créé, avec les valeurs que TU as entrées,
à l'étape que TU as choisie.
Retirer un seul de ces trois éléments = clone de VisuAlgo.

### Acteur Unique
Étudiant CS, 17-25 ans, cégep / université / bootcamp,
bloqué à 2h AM avant une deadline.

### Critère de Succès Mesurable
50 signups en 30 jours OU 1 enseignant assigne VAD en classe dans 60 jours.

---

## PHASE 4 — az-stack

### Stack Finale (sources primaires vérifiées, 26 avril 2026)

#### Frontend — ReaAaS-N-frontend/
| Package | Version | Statut |
|---------|---------|--------|
| react | 18.2.0 | Garder |
| react-dom | 18.2.0 | Garder |
| typescript | 5.0.2 | Garder |
| vite | 6.3.5 | Garder |
| @vitejs/plugin-react | 4.0.3 | Garder |
| @xyflow/react | 12.10.2 | Ajouter |
| @mui/material | ^6.0.0 | Ajouter |
| @emotion/react | ^11 | Ajouter |
| @emotion/styled | ^11 | Ajouter |
| @hello-pangea/dnd | 18.0.1 | REMPLACE react-beautiful-dnd (deprecated) |
| react-router-dom | 7.6.1 | Garder |
| uuid | 11.1.0 | Garder |

#### Backend — ReaAaS-N-backend/
| Package | Version | Statut |
|---------|---------|--------|
| express | 5.1.0 | Garder |
| cors | 2.8.5 | Garder |
| groq-sdk | 1.1.2 | Ajouter |
| dotenv | ^16 | Ajouter |
| nodemon | 3.1.10 | Garder (dev) |

#### AI Provider
- Provider: Groq Cloud (gratuit)
- Modèle: llama-3.1-8b-instant
- Limite: 14,400 RPD gratuits
- SDK: groq-sdk v1.1.2 (TypeScript natif, zéro Python)

### Architecture
```
React :5173 (Vite dev)
    └── POST /api/ai/explain
           ↓
    Express :3001
           └── groq-sdk v1.1.2
                  └── api.groq.com → llama-3.1-8b-instant
                         └── { explanation: "..." }
```

### Stacks Rejetées
- litellm (npm) : port JS non officiel, v0.12.0, abandonné 2 ans, no Groq support
- LiteLLM Python proxy : overhead inutile Phase 1
- react-beautiful-dnd : officiellement deprecated par Atlassian
- @mui/material v9 : react-is version pinning requis avec React 18
- MindsDB, LangChain, PandaAI, QuaNTecH : CUT définitif

---

## PHASE 5 — az-environment-bootstrapper

### Verdict : BLOCKERS FOUND — 8 corrections avant npm install

| # | Fichier | Problème | Sévérité |
|---|---------|----------|----------|
| B1 | ReaAaS-N-frontend/package.json | Dépendances déclarées dans scripts{} | CRITIQUE |
| B2 | ReaAaS-N-frontend/vite.config.ts | Double `export default defineConfig(...)` | CRITIQUE |
| B3 | ReaAaS-N-frontend/src/main.tsx | Double rendu — un sans BrowserRouter | CRITIQUE |
| B4 | ReaAaS-N-backend/package.json | `"main": "index.js"` mais fichier = server.js | CRITIQUE |
| B5 | .env (racine) | PANDAAI_API_KEY (CUT) / manque GROQ_API_KEY | CRITIQUE |
| B6 | ReaAaS-N-frontend/package.json | Script `"test"` absent (vitest non câblé) | CRITIQUE |
| B7 | CircuitDesignerPage.test.tsx | Import `calculateCircuitState` non exporté | CRITIQUE |
| B8 | ReaAaS-N-frontend/src/theme.ts | text primary `#4F5D75` trop sombre / secondary `#9FFFFF` typo | MINEUR |

### Corrections détaillées

**B1 — package.json frontend :** Déplacer tout ce qui est dans `scripts{}` vers `"dependencies": {}`. Ajouter `@hello-pangea/dnd`, `@xyflow/react`, `@mui/material`, `@emotion/react`, `@emotion/styled`. Ajouter script `"test": "vitest"`.

**B2 — vite.config.ts :** Fusionner les deux `export default defineConfig(...)` en un seul avec :
```ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

**B3 — main.tsx :** Supprimer le `ReactDOM.createRoot(...).render(<App />)` sans BrowserRouter. Garder uniquement le render avec `<BrowserRouter>`.

**B4 — package.json backend :** Changer `"main": "index.js"` → `"main": "server.js"`.

**B5 — .env :** Remplacer `PANDAAI_API_KEY=your-pai-api-key` par `GROQ_API_KEY=gsk_votre_cle_ici`. Créer `.env.example` avec `GROQ_API_KEY=your_groq_api_key_here`.

**B6 :** Couvert par B1 (ajout script `"test": "vitest"`).

**B7 — CircuitDesignerPage.test.tsx :** Corriger l'import de `calculateCircuitState` (la fonction n'est pas exportée depuis la source).

**B8 — theme.ts :** `text.primary: '#E0E0E0'`, `text.secondary: '#9FE8FF'`.

### Structure Répertoire Confirmée
```
C:\Users\jeans\Desktop\vad\VisualAlgorithmDesigner\
├── .env                          (à remplacer — B5)
├── .env.example                  (à créer)
├── .gitignore
├── .venv/                        (Python env — non utilisé Phase 1)
├── requirements.txt              (mindsdb/pandasai — non utilisé Phase 1)
├── server.js                     (root — doublon, ignorer)
├── package.json                  (root — doublon, ignorer)
├── ReaAaS-N-backend/
│   ├── package.json              (à corriger — B4)
│   └── server.js                 (à enrichir avec POST /api/ai/explain)
└── ReaAaS-N-frontend/
    ├── package.json              (à corriger — B1, B6)
    ├── vite.config.ts            (à corriger — B2)
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── src/
        ├── main.tsx              (à corriger — B3)
        ├── theme.ts              (à corriger — B8)
        ├── App.tsx
        ├── index.css
        ├── test/setup.ts
        ├── pages/
        │   ├── AlgorithmBuilderPage.tsx    (câbler bouton AI — Phase 1)
        │   ├── AlgorithmBuilderPage.test.tsx
        │   ├── CircuitDesignerPage.tsx
        │   └── CircuitDesignerPage.test.tsx (à corriger — B7)
        └── components/CircuitDesigner/
            ├── PropertiesPanel.tsx          (ajouter Colab badge — Phase 2)
            └── nodes/
```

### Surface de Commandes Minimale
```bash
# Frontend (ReaAaS-N-frontend/)
npm install
npm run dev          # Vite → http://localhost:5173
npm run build        # → dist/
npm run test         # vitest

# Backend (ReaAaS-N-backend/)
npm install
npm run dev          # nodemon → http://localhost:3001
npm start            # production
```

### Mécanismes de Déploiement
- **OS :** Windows/macOS/Linux — npm cross-platform, aucun .bat/.msi requis
- **Gateway Phase 1 :** Express :3001 est le gateway — MCP non requis Phase 1
- **start-dev.ps1 :** Script PowerShell recommandé pour démarrer les deux serveurs en parallèle

---

## PLAN D'IMPLÉMENTATION — Phase 0 à Phase 3

### Phase 0 — Débloquer le code (Jours 1-2, BLOQUANT)

- [ ] 1. Fix `ReaAaS-N-frontend/package.json` — dépendances + @hello-pangea/dnd + @xyflow/react + @mui + script test
- [ ] 2. Fix `ReaAaS-N-frontend/vite.config.ts` — fusionner le double export default
- [ ] 3. Fix `ReaAaS-N-frontend/src/main.tsx` — supprimer le render sans BrowserRouter
- [ ] 4. Fix `ReaAaS-N-backend/package.json` — `"main": "server.js"`
- [ ] 5. Fix `CircuitDesignerPage.test.tsx` — corriger import calculateCircuitState
- [ ] 6. Fix `theme.ts` — text primary → #E0E0E0, text secondary → #9FE8FF
- [ ] 7. Remplacer `.env` — GROQ_API_KEY=gsk_...
- [ ] 8. Créer `.env.example` — GROQ_API_KEY=your_groq_api_key_here
- [x] 9. Créer `docs/plan.md` (CE FICHIER)
- [ ] 10. Bonus : créer `start-dev.ps1`

### Phase 1 — AI Tutor MVP (Jours 3-4)

- [ ] 11. `npm install groq-sdk dotenv` dans ReaAaS-N-backend/
- [ ] 12. Créer `POST /api/ai/explain` dans `ReaAaS-N-backend/server.js`

  Payload attendu :
  ```json
  {
    "steps": [...],
    "inputValues": [5, 3, 8, 1],
    "stepIndex": 2,
    "algorithmName": "Bubble Sort"
  }
  ```
  Réponse :
  ```json
  { "explanation": "À l'étape 3, ton algo compare 5 et 3..." }
  ```

- [ ] 13. Câbler bouton "Explain this step" dans `AlgorithmBuilderPage.tsx`
- [ ] 14. Câbler bouton "Debug with AI" dans `CircuitDesignerPage.tsx`

### Phase 2 — Intégrations éducatives (Jour 5)

- [ ] 15. Badge "Open in Colab" dans `PropertiesPanel.tsx`
- [ ] 16. Bouton "Share to Classroom" (URL formatée — zéro API Google requise)
- [ ] 17. Créer `notebooks/quicksort.ipynb`, `binarysearch.ipynb`, `bubblesort.ipynb`

### Phase 3 — Déploiement + Validation (Jours 6-7)

- [ ] 18. Azure for Students ($100 gratuit, no carte, email scolaire) OU Azure Free ($200, carte ID)
- [ ] 19. Post r/learnprogramming + r/compsci + r/cegep (vidéo 90s du core loop)
- [ ] 20. DM 5 profs CS locaux avec lien demo

---

## CRITÈRES PASS/KILL

| Critère | Condition |
|---------|-----------|
| Build frontend | `npm run dev` → zéro erreur TypeScript |
| Build backend | `npm run dev` → serveur Express :3001 démarre |
| Core loop | `POST /api/ai/explain` → réponse < 3 secondes |
| UI | Bouton "Explain" → texte affiché dans l'interface |
| Production | URL publique → app accessible sans localhost |
| Marché KILL | < 50 signups en 30 jours ET 0 enseignant en 60 jours |

---

## PHASE 6 — az-data-api-security

### Entités Domaine (extraites du code source)

Depuis `AlgorithmBuilderPage.tsx` :
```ts
interface Step { id: string; content: string; }
// state: steps[], currentStep: number, inputValues via llmInput
```

Depuis `CircuitDesignerPage.tsx` :
```ts
// Node<CircuitNodeData> + Edge[] — sauvegardés en localStorage (Phase 1)
// nodeTypes: inputSource, outputSink, andGate, orGate, notGate
```

---

### Modèle Relationnel — Phase 2 (PostgreSQL)

> Phase 1 = zéro DB. localStorage pour circuit. Modèle défini maintenant pour éviter la drift.

```sql
-- Utilisateurs
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,            -- Argon2id
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Algorithmes créés par l'utilisateur
CREATE TABLE algorithms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Étapes d'un algorithme (ordonné par position)
CREATE TABLE algorithm_steps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id UUID NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
  position     SMALLINT NOT NULL,          -- ordre drag-drop
  content      VARCHAR(500) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (algorithm_id, position)
);

-- Circuits logiques
CREATE TABLE circuits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  is_public   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Snapshots de sauvegarde d'un circuit (remplace localStorage Phase 2)
CREATE TABLE circuit_saves (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_id  UUID NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
  nodes_json  JSONB NOT NULL,              -- Node<CircuitNodeData>[]
  edges_json  JSONB NOT NULL,              -- Edge[]
  viewport_json JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Log des appels AI (monitoring + abuse detection)
CREATE TABLE ai_explain_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL = anonyme Phase 1
  algorithm_id   UUID REFERENCES algorithms(id) ON DELETE SET NULL,
  step_index     SMALLINT NOT NULL,
  prompt_hash    CHAR(64) NOT NULL,        -- SHA-256 pour déduplication
  response_text  TEXT NOT NULL,
  latency_ms     INTEGER NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Index sur chemins de requête réels

```sql
CREATE INDEX idx_algorithms_user_id     ON algorithms(user_id);
CREATE INDEX idx_algorithm_steps_alg_id ON algorithm_steps(algorithm_id, position);
CREATE INDEX idx_circuits_user_id       ON circuits(user_id);
CREATE INDEX idx_circuit_saves_circuit  ON circuit_saves(circuit_id, created_at DESC);
CREATE INDEX idx_ai_logs_user_created   ON ai_explain_logs(user_id, created_at DESC);
```

---

### Contrat API REST

#### Envelope standard

```json
// Succès
{ "status": "success", "data": {} }

// Erreur
{ "status": "error", "error": "BAD_REQUEST", "message": "Invalid payload" }
```

#### Phase 1 — Anonyme (IMPLÉMENTER MAINTENANT)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/health` | Aucune | Health check |
| POST | `/api/ai/explain` | Aucune | **Core loop** — explication d'une étape |

#### Phase 2 — Authentifié (après validation Phase 1)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/v1/auth/register` | Aucune | Créer compte |
| POST | `/api/v1/auth/login` | Aucune | Login → JWT |
| GET | `/api/v1/algorithms` | JWT | Lister mes algos |
| POST | `/api/v1/algorithms` | JWT | Créer algo |
| GET | `/api/v1/algorithms/:id` | JWT (owner ou public) | Lire algo |
| PUT | `/api/v1/algorithms/:id` | JWT + owner | Modifier algo |
| DELETE | `/api/v1/algorithms/:id` | JWT + owner | Supprimer algo |
| GET | `/api/v1/circuits` | JWT | Lister mes circuits |
| POST | `/api/v1/circuits` | JWT | Créer circuit |
| GET | `/api/v1/circuits/:id` | JWT (owner ou public) | Lire circuit |
| PUT | `/api/v1/circuits/:id` | JWT + owner | Modifier circuit |
| DELETE | `/api/v1/circuits/:id` | JWT + owner | Supprimer circuit |
| POST | `/api/v1/ai/explain` | JWT | Core loop authentifié (loggé en DB) |

---

### Schémas de Validation — Phase 1

#### `POST /api/ai/explain`

```js
// Validation (express-validator ou zod côté backend)
{
  steps: [
    { id: string (UUID v4), content: string (1-500 chars) }
  ]  // min 1 item, max 50 items

  inputValues: number[]   // min 1 item, max 20 items

  stepIndex: integer      // >= 0, < steps.length

  algorithmName: string   // optionnel, 1-100 chars si fourni
}
```

**Règle Fail Fast :** valider AVANT tout appel groq-sdk. Rejeter avec `400 BAD_REQUEST` si invalide.

#### Exemple de réponse valide

```json
{
  "status": "success",
  "data": {
    "explanation": "À l'étape 3, ton algo compare 5 et 3. Comme 5 > 3, il les échange.",
    "stepIndex": 2,
    "latency_ms": 812
  }
}
```

---

### Frontières de Sécurité Zero-Trust

#### CORS — Correction immédiate (B9 — Phase 0)

```js
// AVANT (dangereux)
app.use(cors());

// APRÈS (Phase 1 dev)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// APRÈS (production — dans .env)
// CORS_ORIGIN=https://votre-domaine.com
```

#### Rate Limiting — Protection quota Groq

```js
// npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  max: 10,                  // 10 requêtes/minute/IP
  message: { status: 'error', error: 'TOO_MANY_REQUESTS', message: 'Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/ai/explain', aiLimiter, explainHandler);
```

14,400 RPD Groq gratuit ÷ 10 req/min = protège la limite même si attaque ciblée.

#### Secrets

| Secret | Stockage | Ne jamais faire |
|--------|----------|-----------------|
| `GROQ_API_KEY` | `.env` uniquement | Hardcoder dans le code |
| `JWT_SECRET` | `.env` uniquement (Phase 2) | Commit dans git |
| `DATABASE_URL` | `.env` uniquement (Phase 2) | Logger dans console |

#### Erreurs Production

```js
// Middleware erreur global — NE PAS exposer stack traces en production
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    status: 'error',
    error: err.code || 'INTERNAL_ERROR',
    message: isProd ? 'An error occurred' : err.message,
  });
});
```

#### Auth JWT — Phase 2 (ne pas implémenter avant validation Phase 1)

- Algorithme : `HS256`, secret min 32 chars aléatoires
- Expiry : `access_token` = 15min, `refresh_token` = 7 jours
- Password hashing : **Argon2id** (package `argon2` npm)
- Stocker refresh token côté serveur (table `refresh_tokens`) — pas dans localStorage

---

### Premier Test Request — Phase 1

```bash
# Tester le core loop immédiatement après fix Phase 0
curl -X POST http://localhost:3001/api/ai/explain \
  -H "Content-Type: application/json" \
  -d '{
    "steps": [
      {"id": "a1b2c3d4-0000-0000-0000-000000000001", "content": "Compare element i with element i+1"},
      {"id": "a1b2c3d4-0000-0000-0000-000000000002", "content": "If i > i+1, swap them"},
      {"id": "a1b2c3d4-0000-0000-0000-000000000003", "content": "Move to next pair"}
    ],
    "inputValues": [5, 3, 8, 1],
    "stepIndex": 1,
    "algorithmName": "Bubble Sort"
  }'

# Réponse attendue :
# { "status": "success", "data": { "explanation": "...", "stepIndex": 1, "latency_ms": ... } }
```

---

### Nouvelles Tâches Phase 0 (ajoutées depuis Phase 2)

- [ ] B9. Fix `cors()` → origins explicites dans `server.js`
- [ ] B10. Ajouter middleware erreur global dans `server.js`
- [ ] B11. Ajouter `express-rate-limit` sur `POST /api/ai/explain`
- [ ] B12. Ajouter `GET /api/health` endpoint

---

## SKILLS RESTANTS (à exécuter dans l'ordre après Phase 0)

- [x] **az-data-api-security** — modèle DB, auth JWT, validation Fail Fast, CORS Zero-Trust
- [ ] **az-migration-seed-manager** — migrations PostgreSQL, seed data, rollback
- [ ] **az-frontend** — états empty/loading/error/success, palette.css, design tokens
- [ ] **az-ticket-to-task-planner** — tâches exécutables + critères d'acceptation formels
- [ ] **az-implementation-runner** — exécution après contrat DB/API prêt
- [ ] **az-browser-visual-qa** — test core loop en vrai navigateur (Playwright)
- [ ] **az-cost-and-limits-guardrail** — quotas Groq 14,400 RPD, coûts Azure
- [ ] **az-deploy-survival** — sortie localhost, CI/CD, HTTPS, .env prod
- [ ] **az-product-docs-handoff** — README final, .env.example, runbook, API guide
- [ ] **az-observability-feedback-loop** — logs, métriques post-lancement, corrections
- [ ] **az-dependency-maintenance** — vulnérabilités CVE, upgrades sécurisés

---

## DÉCISIONS IRRÉVERSIBLES (NE PAS ROUVRIR)

| Décision | Raison |
|----------|--------|
| groq-sdk v1.1.2 (pas litellm npm) | litellm npm = port non officiel, abandonné 2 ans |
| @hello-pangea/dnd (pas react-beautiful-dnd) | react-beautiful-dnd officiellement deprecated Atlassian |
| @mui/material v6 (pas v9) | v9 = react-is pinning incompatible React 18 |
| Express sans LiteLLM proxy | Overhead inutile Phase 1 |
| Groq free tier llama-3.1-8b-instant | 14,400 RPD gratuit, hardware i5/UHD 620 insuffisant local LLM |
| PandaAI = CUT | .env confirme abandon, remplacé groq-sdk |
| MindsDB = CUT | Placeholder vides dans QuaNTecH, incompatible |
| QuaNTecH = Phase 4 | Fonctions retournent strings vides, stack Webpack+Emotion incompatible |
| Zéro Python Phase 1 | .venv et requirements.txt ignorés jusqu'à Phase 2+ |

---

## PHASE 7 — az-frontend

> Session du 26 avril 2026 — Interface harpoon.io × H2O.ai

### Concept Validé par Recherche

**Référence UX : harpoon.io** (vérifié source primaire, 26 avril 2026)
> "Drag & Drop Simplicity — Instantly search for and find any piece of commercial or
> open source software on the planet and deploy it to the cloud with one click."

harpoon.io = catalogue gauche + canvas centre + connexions par drag-drop.
**Notre adaptation :** au lieu de services Kubernetes, les nœuds sont des algorithmes H2O.
Au lieu de déployer sur cloud, on visualise et explique le pipeline ML.

**Référence Algorithmes : H2O.ai Appendix A — Parameters** (vérifié source primaire, 26 avril 2026)
Source : https://docs.h2o.ai/h2o/latest-stable/h2o-docs/parameters.html
Catalogue de paramètres ML couvrant : GBM, GLM, RandomForest, DeepLearning,
XGBoost, StackedEnsemble, AutoML, K-Means, PCA, GLRM, IsolationForest, CoxPH.

**Analyse builder-app (C:\Users\jeans\Desktop\builder-app\algorithm-builder-app\src)**
- `Palette.js` → pattern confirmé : left sidebar avec search + drag `data-type`
- `Canvas.js` → canvas 2D natif (à remplacer par @xyflow/react déjà en stack)
- `components.js` → catalogue d'algorithmes déjà structuré (à migrer en TypeScript)
- Pattern: `componentsLibrary` → `searchComponents()` → `createComponent()` — directement portaçble

---

### Pivot UX — De "Steps Manuels" à "Algorithmes Pré-existants"

**Avant (AlgorithmBuilderPage) :** l'utilisateur crée ses propres étapes textuelles
**Après (AlgorithmDesignerPage) :** l'utilisateur drage des algorithmes H2O du catalogue

Les deux pages coexistent :
- `AlgorithmBuilderPage` → pour les étudiants CS qui veulent créer leurs propres étapes
- `AlgorithmDesignerPage` → pour les étudiants ML qui veulent assembler des pipelines H2O
- `CircuitDesignerPage` → pour les étudiants EE (logique booléenne, inchangé)

Le **Core Loop reste intact** : l'AI explique l'état d'exécution à une étape précise.

---

### Layout — Shell Harpoon-Style (3 colonnes)

```
┌─────────────────────────────────────────────────────────────────┐
│  AppBar — "VisualAlgorithmDesigner"   [Builder] [Designer] [Circuit] │
├──────────────┬──────────────────────────────┬───────────────────┤
│  PALETTE     │        CANVAS                │  PROPERTIES       │
│  (240px)     │   (@xyflow/react)            │  (300px)          │
│              │                              │                   │
│ [Search...]  │   ┌──────────┐               │  GBM Parameters   │
│              │   │  GBM     │──────────┐    │  ─────────────    │
│ Supervised   │   │  Node    │          │    │  ntrees: [50]     │
│ ─ GBM        │   └──────────┘          ↓    │  max_depth: [5]   │
│ ─ GLM        │              ┌──────────┐    │  learn_rate: 0.1  │
│ ─ XGBoost    │              │ AutoML   │    │                   │
│ ─ RF         │              │  Node    │    │  [▶ Explain Step] │
│ ─ DeepLearn  │              └──────────┘    │                   │
│              │                              │  AI Output:       │
│ Unsupervised │  [empty state placeholder]   │  "GBM at step 2   │
│ ─ K-Means    │                              │   compares..."    │
│ ─ PCA        │                              │                   │
│ ─ IsoForest  │                              │  [loading...]     │
│              │                              │  [error banner]   │
│ AutoML       │                              │                   │
│ ─ AutoML     │                              │                   │
└──────────────┴──────────────────────────────┴───────────────────┘
```

---

### Arbre de Composants

```
ReaAaS-N-frontend/src/
├── styles/
│   └── palette.css                          (NOUVEAU — dérivé image asset/)
├── services/
│   ├── algorithmCatalog.ts                  (NOUVEAU — catalogue statique H2O)
│   └── api.ts                               (NOUVEAU — wraps fetch calls)
├── pages/
│   ├── AlgorithmDesignerPage.tsx            (NOUVEAU — page principale harpoon-style)
│   ├── AlgorithmBuilderPage.tsx             (EXISTANT — garder pour CS steps)
│   └── CircuitDesignerPage.tsx              (EXISTANT — garder pour EE)
└── components/
    ├── AlgorithmDesigner/
    │   ├── AlgorithmPalette.tsx             (NOUVEAU — left sidebar, porté de Palette.js)
    │   │   ├── PaletteSearchInput.tsx
    │   │   └── PaletteCategoryGroup.tsx
    │   ├── AlgorithmCanvas.tsx              (NOUVEAU — @xyflow/react wrapper)
    │   │   ├── AlgorithmNode.tsx            (NOUVEAU — custom node avec handles H2O)
    │   │   └── PipelineEdge.tsx             (NOUVEAU — animated edge)
    │   ├── AlgorithmPropertiesPanel.tsx     (NOUVEAU — H2O param editor)
    │   │   └── H2OParamField.tsx            (NOUVEAU — input per parameter type)
    │   └── AIExplanationPanel.tsx           (NOUVEAU — résultat Groq)
    └── CircuitDesigner/                     (EXISTANT — inchangé)
        ├── PropertiesPanel.tsx
        └── nodes/
```

---

### Catalogue H2O — Lot 1 MVP (6 algorithmes)

```typescript
// services/algorithmCatalog.ts
export interface H2OAlgorithm {
  id: string;
  type: string;                 // node type dans @xyflow/react
  label: string;
  category: 'supervised' | 'unsupervised' | 'automl';
  description: string;
  inputPorts: ('data' | 'validation' | 'model')[];
  outputPorts: ('model' | 'prediction' | 'metrics')[];
  params: H2OParam[];
}

export interface H2OParam {
  key: string;          // ex: 'ntrees', 'max_depth', 'learn_rate'
  label: string;
  type: 'integer' | 'float' | 'boolean' | 'enum';
  default: number | boolean | string;
  min?: number;
  max?: number;
  options?: string[];   // pour type 'enum'
  description: string;  // extrait H2O docs
}
```

**Algorithmes Lot 1 MVP :**

| ID | Label | Catégorie | Params Clés H2O |
|----|-------|-----------|-----------------|
| `gbm` | GBM | supervised | ntrees, max_depth, learn_rate, sample_rate, col_sample_rate |
| `glm` | GLM | supervised | family, alpha, lambda, solver, standardize |
| `random_forest` | Random Forest | supervised | ntrees, max_depth, mtries, sample_rate |
| `deep_learning` | Deep Learning | supervised | hidden, epochs, rate, activation |
| `k_means` | K-Means | unsupervised | k, init, max_iterations, seed |
| `automl` | AutoML | automl | max_models, max_runtime_secs, exclude_algos, sort_metric |

---

### Carte d'État

| État | Scope | Stockage |
|------|-------|----------|
| `nodes: Node[]` | AlgorithmDesignerPage | local state (useState) |
| `edges: Edge[]` | AlgorithmDesignerPage | local state (useState) |
| `selectedNodeId: string \| null` | AlgorithmDesignerPage | local state |
| `nodeParams: Record<string, Record<string, any>>` | AlgorithmDesignerPage | local state |
| `pipelineResult: ExplainResult \| null` | AlgorithmDesignerPage | local state |
| `isExplaining: boolean` | AlgorithmDesignerPage | local state |
| `explainError: string \| null` | AlgorithmDesignerPage | local state |
| `paletteSearch: string` | AlgorithmPalette | local state |
| `algorithmCatalog` | services/algorithmCatalog.ts | static import (pas de fetch) |

> Zéro Redux. Zéro Zustand. Zéro Context. State local uniquement.
> Seul cas global futur : auth (Phase 3) — pas Phase 1.

---

### Fonctions Service

```typescript
// services/api.ts
export async function explainPipeline(payload: {
  nodes: Array<{ id: string; type: string; params: Record<string, any> }>;
  edges: Array<{ source: string; target: string }>;
  focusNodeId: string;
}): Promise<{ explanation: string }> {
  const res = await fetch('/api/ai/explain-pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

// services/algorithmCatalog.ts  ← données statiques, zero fetch
export const ALGORITHM_CATALOG: H2OAlgorithm[] = [ ... ];
export function searchAlgorithms(query: string): H2OAlgorithm[] { ... }
export function getAlgorithmById(id: string): H2OAlgorithm | undefined { ... }
```

**Backend — nouveau endpoint :**

```
POST /api/ai/explain-pipeline
{
  "nodes": [
    { "id": "n1", "type": "gbm", "params": { "ntrees": 50, "max_depth": 5 } },
    { "id": "n2", "type": "automl", "params": { "max_models": 10 } }
  ],
  "edges": [{ "source": "n1", "target": "n2" }],
  "focusNodeId": "n1"
}
→ { "status": "success", "data": { "explanation": "...", "latency_ms": 843 } }
```

---

### États Empty / Loading / Error / Success

| État | Composant | Rendu |
|------|-----------|-------|
| **Empty canvas** | AlgorithmCanvas | Illustration + "Glissez un algorithme depuis la palette pour commencer" |
| **Empty properties** | AlgorithmPropertiesPanel | "Sélectionnez un nœud sur le canvas pour voir ses paramètres" |
| **Loading explain** | AIExplanationPanel | MUI `CircularProgress` + "L'IA analyse le pipeline..." |
| **Error explain** | AIExplanationPanel | MUI `Alert severity="error"` + message d'erreur |
| **Success explain** | AIExplanationPanel | Texte formaté markdown dans MUI `Paper` |
| **Palette empty search** | AlgorithmPalette | "Aucun algorithme correspondant à '{query}'" |

> Ne pas déclarer succès avant inspection Network tab → réponse 200 + `data.explanation` non vide.

---

### palette.css — Palette Dérivée de l'Image

**Source :** `asset/color_scheme_palette_scheme.jpg`
**Analyse de l'image :** composition cosmique avec Terre entourée de deux univers :
- Gauche : organique-fantaisie (fleurs, sphères) → palette mauve-rose-corail
- Droite : techno-data (circuits, données) → palette teal-cyan-acier
- Fond : espace profond charbon/navy

**Chemin de fichier :** `ReaAaS-N-frontend/src/styles/palette.css`
**Import unique dans :** `ReaAaS-N-frontend/src/main.tsx`

```css
/* Auto-generated palette - source: asset/color_scheme_palette_scheme.jpg */
/* Extracted: 26 avril 2026 */
:root {
  /* ─── Core Colors ─────────────────────────────────────── */
  --color-primary:    #3D8A88;   /* teal dominant — axe tech/data droit */
  --color-secondary:  #7B5C8A;   /* mauve — axe organique gauche */
  --color-accent:     #E8856A;   /* corail — action haute chroma */
  --color-surface:    #1A1B2E;   /* espace profond — fond principal dark mode */
  --color-surface-alt:#242540;   /* surface légèrement élevée */
  --color-on-surface: #DDE8EC;   /* texte clair sur fond sombre */

  /* ─── Semantic Aliases ────────────────────────────────── */
  --color-bg:         var(--color-surface);
  --color-text:       var(--color-on-surface);
  --color-text-muted: color-mix(in srgb, var(--color-on-surface) 58%, transparent);
  --color-border:     color-mix(in srgb, var(--color-on-surface) 11%, transparent);
  --color-btn-bg:     #2A7070;   /* teal sombre — AA contrast 5.7:1 blanc */
  --color-btn-text:   #ffffff;
  --color-link:       #5DAAAA;   /* teal clair — liens lisibles */
  --color-error:      #C0392B;   /* rouge sémantique */
  --color-success:    #1A8A5A;   /* vert sémantique */
  --color-warning:    #C07A20;   /* ambre sémantique */

  /* ─── Node Type Colors (H2O Algorithm Nodes) ──────────── */
  --color-node-supervised:   #2D6A7A;   /* teal acier */
  --color-node-unsupervised: #5A3A7A;   /* violet profond */
  --color-node-automl:       #6A4A2A;   /* brun chaud */
  --color-node-selected:     #5DAAAA;   /* teal lumineux = sélection */
  --color-edge:              #3D8A88;   /* couleur des connexions */
  --color-edge-animated:     #5DAAAA;   /* pulse animation */

  /* ─── Spacing Tokens ──────────────────────────────────── */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  /* ─── Typography Tokens ───────────────────────────────── */
  --font-size-xs:   0.75rem;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.25rem;
  --font-size-2xl:  1.5rem;

  /* ─── Radius Tokens ───────────────────────────────────── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

**Vérification contraste WCAG AA :**
- `--color-on-surface` (#DDE8EC) sur `--color-surface` (#1A1B2E) → ratio ~12.9:1 ✅ AAA
- `--color-btn-text` (#ffffff) sur `--color-btn-bg` (#2A7070) → ratio ~5.7:1 ✅ AA
- `--color-link` (#5DAAAA) sur `--color-surface` (#1A1B2E) → ratio ~6.1:1 ✅ AA

---

### Migration depuis builder-app

**Ce qui est portaçble directement :**

| builder-app (JS) | VAD cible (TypeScript React) |
|------------------|------------------------------|
| `Palette.js` — search + map draggable | `AlgorithmPalette.tsx` — MUI TextField + MUI List |
| `componentsLibrary` — tableau d'objets | `ALGORITHM_CATALOG` — tableau TypeScript typé |
| `searchComponents(query)` — filtre | `searchAlgorithms(query)` — même logique, typée |
| `data-type` + `data-properties` sur div | `onDragStart` → `ReactFlow.addNodes()` |
| `Canvas.js` — canvas 2D natif | **@xyflow/react déjà en stack** — supérieur |
| `handleDrop` → setComponents | `onDrop` → `useReactFlow().addNodes()` |

> Ne pas copier le canvas 2D de builder-app. @xyflow/react remplace tout.
> Ne pas copier les classes CSS de builder-app. palette.css remplace tout.

---

### No-Polish Boundary (Phase 1 Frontend)

**Implémenter d'abord :**
1. Canvas vide → état empty visible
2. Drag depuis palette → nœud apparaît sur canvas
3. Connexion entre deux nœuds → edge visible
4. Sélection nœud → paramètres H2O dans PropertiesPanel
5. Bouton "Explain" → `POST /api/ai/explain-pipeline` → texte affiché

**Ne pas toucher avant que le core loop fonctionne end-to-end :**
- Animations complexes sur les edges
- Minimap styling
- Node collapse/expand
- Pipeline validation warnings
- Undo/redo

---

### Nouvelles Tâches Phase 7 (à ajouter au PLAN D'IMPLÉMENTATION)

- [ ] F1. Créer `ReaAaS-N-frontend/src/styles/palette.css` (dérivé image asset/)
- [ ] F2. Importer `palette.css` dans `main.tsx`
- [ ] F3. Créer `services/algorithmCatalog.ts` — 6 algorithmes H2O Lot 1
- [ ] F4. Créer `services/api.ts` — `explainPipeline()` avec try/catch
- [ ] F5. Créer `AlgorithmDesignerPage.tsx` — shell 3 colonnes MUI
- [ ] F6. Créer `AlgorithmPalette.tsx` — search + catégories + draggable cards
- [ ] F7. Créer `AlgorithmNode.tsx` — custom node @xyflow/react avec handles
- [ ] F8. Créer `AlgorithmCanvas.tsx` — ReactFlow wrapper + onDrop + empty state
- [ ] F9. Créer `AlgorithmPropertiesPanel.tsx` — H2OParamField par param sélectionné
- [ ] F10. Créer `AIExplanationPanel.tsx` — loading / error / success states
- [ ] F11. Ajouter `POST /api/ai/explain-pipeline` dans `ReaAaS-N-backend/server.js`
- [ ] F12. Router — ajouter `/designer` route dans `App.tsx`
- [ ] F13. Appliquer `palette.css` variables sur MUI theme dans `theme.ts`

---

### Stack — Validations Complémentaires (26 avril 2026)

| Décision | Validation | Source |
|----------|------------|--------|
| @xyflow/react 12.10.2 déjà en stack | ✅ Maintenu activement, v12 release 2024, npm 1.2M/semaine | xyflow.dev |
| @hello-pangea/dnd pour palette list DnD | ✅ Fork actif de react-beautiful-dnd, ~300k/semaine npm | npmjs.com |
| Catalogue H2O statique (pas d'API H2O) | ✅ Les params sont documentés, stables, pas besoin de runtime | h2o.ai/docs |
| MUI v6 pour Palette + PropertiesPanel | ✅ Same stack as existing CircuitDesigner PropertiesPanel | mui.com |
| Zéro Redux pour canvas state | ✅ @xyflow/react v12 gère son propre state avec useNodesState | xyflow.dev |

**Décisions nouvelles IRRÉVERSIBLES :**
- Catalogue H2O = fichier statique TypeScript — pas d'appel API runtime à H2O
- @xyflow/react gère `nodes` et `edges` state (useNodesState, useEdgesState) — pas useState custom
- Pas de canvas 2D natif (builder-app Canvas.js style) — @xyflow/react seulement
- palette.css = source unique de vérité couleur — pas de hex dans les composants
