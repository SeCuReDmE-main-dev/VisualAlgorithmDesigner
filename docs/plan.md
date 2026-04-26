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
