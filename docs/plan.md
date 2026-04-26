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

---

## PHASE 7-2 — AZ-FRONTEND : ANALYSE ERGONOMIE, EFFETS, DIFFÉRENCIATION ET ANNEXES

> Date analyse : 26 avril 2026  
> Contexte : Approfondissement de la Phase 7. Couvre l'inventaire d'interactions, les effets de chaîne, l'automatisation Excel, le système de tutoriel, la disposition IDE 3-panneaux, la différenciation marché, les alternatives à H2O, et le scraping RST.

---

### A. INVENTAIRE D'INTERACTIONS — Compte exact par panneau

L'objectif est de savoir combien d'éléments interactifs existent dans une session type pour calibrer la densité UX et ne pas surcharger l'utilisateur.

#### Panneau Gauche — AlgorithmPalette (240px)

| Élément | Type | Quantité | Notes |
|---------|------|----------|-------|
| SearchInput | Text field | 1 | Filtre en temps réel |
| CategoryToggle | Bouton toggle | ~6 | Supervised / Unsupervised / AutoML / Anomaly / Time Series / NLP |
| AlgorithmCard drag handle | Zone draggable | ~6–20 selon filtre | Chaque carte = 1 cible DnD |
| **Total Palette** | | **~13–27** | Variable selon filtres actifs |

#### Panneau Centre — AlgorithmCanvas (flex-grow)

| Élément | Type | Quantité | Notes |
|---------|------|----------|-------|
| Zoom In | Bouton | 1 | Controls built-in @xyflow |
| Zoom Out | Bouton | 1 | Controls built-in |
| Fit View | Bouton | 1 | Controls built-in |
| Background toggle | Bouton icône | 1 | Toggle grille / dots |
| MiniMap toggle | Bouton icône | 1 | Afficher/cacher minimap |
| Canvas pan | Geste | N/A | Molette + drag natif |
| Canvas zoom | Geste | N/A | Pinch + molette natif |
| Node drag (repositionner) | Geste | N nœuds | 1 par nœud présent |
| Handle (connexion source) | Zone cliquable | N×2 nœuds | 1 source + 1 target par nœud |
| Node sélection (clic) | Clic | N nœuds | Active PropertiesPanel |
| Node suppression (Delete key) | Raccourci clavier | 1 global | Nœud sélectionné |
| Pipeline Save | Bouton icône (toolbar) | 1 | localStorage |
| Pipeline Clear | Bouton icône (toolbar) | 1 | Reset canvas |
| **Total Canvas** | | **~8 fixes + N×4 par nœud** | |

#### Panneau Droit — AlgorithmPropertiesPanel + AIExplanationPanel (300px)

| Élément | Type | Quantité | Notes |
|---------|------|----------|-------|
| H2OParamField integer | NumberInput + Slider | ~3–5 par algo | ntrees, max_depth, nbins |
| H2OParamField float | NumberInput + Slider | ~3–5 par algo | learn_rate, sample_rate |
| H2OParamField boolean | Toggle switch | ~2–4 par algo | standardize, ignore_const_cols |
| H2OParamField enum | Select dropdown | ~1–3 par algo | distribution, histogram_type |
| Reset Params | Bouton secondaire | 1 | Remet les valeurs par défaut H2O |
| Download Workbook | Bouton secondaire | 1 | Export Excel (F14-F15) |
| Explain Pipeline | Bouton primaire CTA | 1 | Déclenche POST /api/ai/explain-pipeline |
| **Total Properties** | | **~12–20 par algo sélectionné** | |

#### Barre de Statut (bottom, 32px)

| Élément | Type | Quantité | Notes |
|---------|------|----------|-------|
| Compteur nœuds | Texte | 1 | read-only |
| Compteur edges | Texte | 1 | read-only |
| Dernière latence Explain | Texte | 1 | ex: "1.2s" |
| Indicateur connexion backend | Icône colored | 1 | vert/rouge |
| **Total Status Bar** | | **4** | Tous read-only sauf indicateur |

#### Barre AppBar (top, 48px)

| Élément | Type | Quantité | Notes |
|---------|------|----------|-------|
| Logo / titre | Lien navigation | 1 | Retour Home |
| Navigation tab "Designer" | Tab | 1 | Actif sur /designer |
| Navigation tab "Algorithm Builder" | Tab | 1 | Route /builder |
| Navigation tab "Circuit Designer" | Tab | 1 | Route /circuit |
| Toggle tutoriel "?" | Bouton icône | 1 | Ouvre TutorialOverlay |
| **Total AppBar** | | **5** | |

#### TOTAL GÉNÉRAL

| Session type (5 nœuds sur canvas) | Éléments interactifs |
|-------------------------------------|----------------------|
| Fixes (palette, canvas controls, AppBar, status) | ~32 |
| Variables (handles, nodes, param fields) | ~40–60 |
| **TOTAL ESTIMÉ** | **~72–92** |

**Règle de conception déduite :** L'interface est dense mais pas surchargée car les éléments variables (paramètres, handles) apparaissent en contexte — uniquement quand un nœud est sélectionné ou présent sur le canvas. La palette est le seul panneau toujours visible avec haute densité.

**Principe directeur :** Reveal on need. Le panneau Properties reste vide (état "Sélectionnez un algorithme") jusqu'à sélection. L'AIExplanationPanel reste caché jusqu'à premier Explain.

---

### B. EFFETS DE CHAÎNE ET FLUIDITÉ — Animations ergonomiques

#### Philosophie d'animation VAD
Ne pas tomber dans le piège des outils no-code saturés (OpenClaw/Base44) qui n'ont aucun retour visuel. Ne pas non plus tomber dans l'excès d'Orange3 (aucune animation du tout). Trouver un équilibre : **chaque action importante a un retour visuel, les actions répétitives sont silencieuses.**

#### Catalogue d'effets

| Déclencheur | Animation | Durée | Implémentation |
|-------------|-----------|-------|----------------|
| Drop nœud sur canvas | `scale(0.8)→scale(1.0)` + `box-shadow` glow couleur catégorie | 200ms ease-out | CSS keyframe `@keyframes nodeDropIn` sur `.react-flow__node` |
| Hover nœud | `scale(1.02)` + `box-shadow` elevation +4px | 150ms ease | CSS `:hover` sur `.algorithm-node` |
| Handle hover (zone de connexion) | Pulsation `scale(1.0)→scale(1.4)→scale(1.0)` + couleur `--color-accent` | 600ms repeat | CSS `@keyframes handlePulse` sur `.react-flow__handle:hover` |
| Edge créé (connexion réussie) | Edge animé SVG `strokeDashoffset` → 0 (ligne se dessine) | 400ms ease-in | `animated: true` + CSS `@keyframes drawEdge` |
| Pipeline complet (tous connectés) | Tous les nœuds : border glow `--color-accent` permanent subtil | continu | Classe `.node-complete` ajoutée via `updateNode` |
| Clic "Explain" | Ripple `@keyframes rippleOut` sur bouton + shimmer sur `AIExplanationPanel` | 300ms ripple, shimmer pendant loading | CSS + état `isLoading` dans composant |
| Réponse AI reçue | `opacity: 0 → 1` + `translateY(8px → 0)` sur texte | 300ms ease-out | CSS `@keyframes textFadeIn` |
| Nœud supprimé | `scale(1.0)→scale(0)` + `opacity: 1→0` | 200ms ease-in | Géré via `onNodesChange` + classe CSS |
| Tour tutoriel step | Tooltip flotte vers le haut `translateY(-4px)→translateY(0)` | 300ms | CSS transition sur `TutorialOverlay` |
| Download Workbook | Icône téléchargement spin 1× | 400ms | CSS `@keyframes downloadSpin` |

#### Règles d'implémentation

1. **Toutes les keyframes dans `palette.css`** — section dédiée `/* === ANIMATIONS === */`
2. **Jamais de JavaScript pour les transitions hover** — CSS pur
3. **JavaScript uniquement pour les animations d'état** (nodeDropIn, edgeDrawIn, textFadeIn) via ajout de classes CSS
4. **Durées :** micro-interactions ≤ 200ms, transitions d'état 200–400ms, animations continues subtiles (≤ 3% de mouvement)
5. **Respecter `prefers-reduced-motion`** — wrapper global dans `palette.css` :
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

#### Implémentation @xyflow spécifique

```typescript
// Edge animé — appliqué à tous les edges lors de onConnect
const onConnect = useCallback((params) => {
  setEdges((eds) => addEdge({ ...params, animated: true, className: 'vad-edge' }, eds));
}, []);
```

```typescript
// Drop nœud — animation via classe CSS
const onDrop = useCallback((event) => {
  // ... screenToFlowPosition ...
  const newNode = {
    id: getId(),
    type,
    position,
    data: { label: type, animating: true },
    className: 'node-drop-in',
  };
  setNodes((nds) => nds.concat(newNode));
  // Retire la classe après animation
  setTimeout(() => {
    setNodes((nds) =>
      nds.map((n) => n.id === newNode.id ? { ...n, className: '' } : n)
    );
  }, 250);
}, [screenToFlowPosition, type]);
```

#### Effets particules — Décision NON

Les effets particules (sparkle burst sur connexion) sont séduisants mais :
- Ajoutent ~15kB de librairie (react-particles / tsparticles)
- Ralentissent sur machines d'étudiants (GPU limité)
- Ont l'air "amateur" si mal calibrés
- **Décision : SVG `<animateMotion>` léger sur connexion réussie** (cercle qui part de source vers target, 1 fois, 600ms) — via custom edge type `AnimatedConnectionEdge`. Implémenté en CSS/SVG pur, 0 librairie supplémentaire.

---

### C. AUTOMATISATION EXCEL — Export de workbooks H2O

#### Justification
Les étudiants en ML et data analysts vivent dans Excel. Un export workbook pré-rempli avec les plages de valeurs H2O est un différenciateur pratique fort. Aucun concurrent open-source (Orange3, Mercury, KNIME web) ne propose ça.

#### Stack Excel côté client

| Option | Stars | Licence | Bundle | Verdict |
|--------|-------|---------|--------|---------|
| **SheetJS (xlsx)** | 35k | Apache 2.0 | ~220kB (CDN) / ~120kB (tree-shaken) | ✅ CHOISI |
| ExcelJS | 12k | MIT | ~400kB | Trop lourd pour MVP |
| Luckysheet | 15k | MIT | >1MB + serveur | Éditeur complet, overkill |

```bash
npm install xlsx
# Ajout dans ReaAaS-N-frontend/package.json
```

#### Architecture workbookExporter.ts

```typescript
// services/workbookExporter.ts
import * as XLSX from 'xlsx';

export interface WorkbookTemplate {
  algorithmId: string;
  algorithmName: string;
  params: Array<{
    name: string;
    type: 'integer' | 'float' | 'boolean' | 'enum';
    defaultValue: number | boolean | string;
    minValue?: number;
    maxValue?: number;
    description: string;
  }>;
}

export function generateWorkbook(template: WorkbookTemplate): void {
  const wb = XLSX.utils.book_new();

  // Feuille 1 : Paramètres avec plages
  const paramsData = [
    ['Paramètre', 'Valeur par défaut', 'Min', 'Max', 'Type', 'Description'],
    ...template.params.map((p) => [
      p.name,
      p.defaultValue,
      p.minValue ?? '',
      p.maxValue ?? '',
      p.type,
      p.description,
    ]),
  ];
  const wsParams = XLSX.utils.aoa_to_sheet(paramsData);
  XLSX.utils.book_append_sheet(wb, wsParams, 'Paramètres H2O');

  // Feuille 2 : Grid d'expérimentation (5 runs vides)
  const gridHeaders = ['Run #', ...template.params.map((p) => p.name), 'Score (AUC)', 'Notes'];
  const gridData = [
    gridHeaders,
    ...Array.from({ length: 5 }, (_, i) => [i + 1, ...template.params.map((p) => p.defaultValue), '', '']),
  ];
  const wsGrid = XLSX.utils.aoa_to_sheet(gridData);
  XLSX.utils.book_append_sheet(wb, wsGrid, 'Expériences');

  XLSX.writeFile(wb, `${template.algorithmName}_params.xlsx`);
}
```

#### Workbooks pré-définis Lot 1 (F15)

| Algorithme | Paramètres inclus | Feuilles |
|------------|-------------------|---------|
| GBM | ntrees, max_depth, learn_rate, sample_rate, col_sample_rate | Paramètres + Expériences |
| Random Forest | ntrees, max_depth, mtries, sample_rate, nbins | Paramètres + Expériences |
| GLM | alpha, lambda, solver, standardize, family | Paramètres + Expériences |
| Deep Learning | epochs, hidden, rate, activation, dropout_ratio | Paramètres + Expériences |
| K-Means | k, max_iterations, init, seed, estimate_k | Paramètres + Expériences |
| AutoML | max_models, max_runtime_secs, include_algos, sort_metric, seed | Paramètres + Expériences |

**Point d'entrée UI :** Bouton "Télécharger Workbook Excel" dans `AlgorithmPropertiesPanel`, section footer. Icône `DownloadIcon` (MUI). Déclenché uniquement quand un algorithme est sélectionné.

---

### D. SYSTÈME DE TUTORIEL — Réactif et non-intrusif

#### Philosophie : Tutoriel contextuel vs modal overlay

| Approche | Pros | Cons | Verdict |
|----------|------|------|---------|
| Modal overlay (Shepherd.js) | Facile, 5min setup | Bloque canvas, obscure le contexte | ❌ |
| Vidéo tutorial | Complet | Statique, pas réactif | ❌ |
| **Tooltip flottant contextuel** | Ancré aux vrais éléments, non-bloquant | Plus complexe à implémenter | ✅ CHOISI |
| Highlight overlay + tooltip | Mix — highlight zone + tooltip | Librairie driver.js 5kB | ✅ OPTION BONUS |

#### Architecture TutorialOverlay.tsx

```typescript
// components/AlgorithmDesigner/TutorialOverlay.tsx
// État dans AlgorithmDesignerPage (local state)
const [tutorialStep, setTutorialStep] = useState<number | null>(null);

// Initialisation — premier visite
useEffect(() => {
  const seen = localStorage.getItem('vad_tutorial_seen');
  if (!seen) setTutorialStep(0);
}, []);

const TUTORIAL_STEPS = [
  {
    targetAttr: 'data-tutorial-palette',    // attribut sur AlgorithmPalette
    message: 'Glissez un algorithme depuis ici vers le canvas →',
    position: 'right',
  },
  {
    targetAttr: 'data-tutorial-canvas',     // attribut sur AlgorithmCanvas vide
    message: 'Déposez l\'algorithme ici pour créer un nœud',
    position: 'center',
  },
  {
    targetAttr: 'data-tutorial-handle',     // attribut sur premier handle nœud
    message: 'Connectez deux nœuds en tirant ce point vers un autre nœud',
    position: 'right',
  },
  {
    targetAttr: 'data-tutorial-properties', // attribut sur PropertiesPanel
    message: 'Configurez les paramètres H2O de l\'algorithme sélectionné',
    position: 'left',
  },
  {
    targetAttr: 'data-tutorial-explain',    // attribut sur bouton Explain
    message: 'Cliquez pour obtenir une explication IA de votre pipeline',
    position: 'top',
  },
];
```

#### Avancement automatique du tutoriel

Le tutoriel est **réactif** : il avance seul quand l'utilisateur effectue l'action attendue.

| Step | Action attendue | Déclencheur |
|------|----------------|-------------|
| 0 (Palette) | Drag d'un algo depuis palette | `onDragStart` dans AlgorithmPalette |
| 1 (Canvas vide) | Drop sur canvas | `onDrop` dans AlgorithmCanvas |
| 2 (Handle) | Début connexion (mousedown sur handle) | `onConnectStart` de @xyflow |
| 3 (Properties) | Nœud sélectionné | `onSelectionChange` de @xyflow |
| 4 (Explain) | Clic "Explain" | `onClick` sur ExplainButton |

```typescript
// Complétion automatique du tutoriel
useEffect(() => {
  if (tutorialStep === TUTORIAL_STEPS.length) {
    localStorage.setItem('vad_tutorial_seen', 'true');
    setTutorialStep(null); // Ferme le tutoriel
  }
}, [tutorialStep]);
```

#### Styling TutorialOverlay (palette.css)

```css
/* === TUTORIAL === */
.tutorial-tooltip {
  position: fixed;
  z-index: 9999;
  background: var(--color-surface-alt);
  border: 2px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  max-width: 240px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  animation: tooltipFloat 300ms ease-out;
}

.tutorial-skip {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  text-align: right;
}
```

**Bouton "?" dans AppBar** — rouvre le tutoriel depuis l'étape 0 si l'utilisateur veut revoir. `localStorage.removeItem('vad_tutorial_seen')` + `setTutorialStep(0)`.

---

### E. DISPOSITION IDE 3-PANNEAUX — Style VS Code / DevTools

#### Analyse des IDEs de référence

| IDE / Outil | Disposition | Raccourcis | Resizable | Persistent |
|-------------|-------------|-----------|-----------|-----------|
| VS Code | 3 panneaux (Activity+Sidebar+Editor+Panel) | Ctrl+B sidebar, Ctrl+J terminal | Oui, drag | Workspace settings |
| Chrome DevTools | Tabs + panneau bottom | Ctrl+Shift+J | Oui | Oui |
| Figma | Left palette + canvas + right properties | Ctrl+\ hide UI | Oui | Non |
| Orange3 (concurrent) | Left category + canvas + right params | Aucun | Non | Non |

**Notre cible :** VS Code / Figma pattern — **palette gauche + canvas centre + propriétés droite**, sans panneau bottom qui bloquerait la canvas (sauf status bar 32px).

#### Implémentation CSS Grid + react-resizable-panels

```typescript
// F17 — npm install react-resizable-panels
// Docs: https://github.com/bvaughn/react-resizable-panels (3.5k stars, MIT)
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// Dans AlgorithmDesignerPage.tsx
<PanelGroup direction="horizontal" onLayout={saveLayout} autoSaveId="vad-layout">
  <Panel defaultSize={22} minSize={15} maxSize={35} id="palette">
    <AlgorithmPalette />
  </Panel>
  <PanelResizeHandle className="resize-handle" />
  <Panel defaultSize={56} minSize={30} id="canvas">
    <AlgorithmCanvas />
  </Panel>
  <PanelResizeHandle className="resize-handle" />
  <Panel defaultSize={22} minSize={15} maxSize={40} id="properties">
    <AlgorithmPropertiesPanel />
    <AIExplanationPanel />
  </Panel>
</PanelGroup>
```

**Fallback sans react-resizable-panels (Phase 1 MVP) :** CSS Grid fixe `grid-template-columns: 240px 1fr 300px`. Migration vers react-resizable-panels en Phase 2.

#### Raccourcis clavier (F18)

| Raccourci | Action | Référence |
|-----------|--------|-----------|
| `Ctrl+B` | Toggle panneau gauche (palette) | VS Code |
| `Ctrl+J` | Toggle panneau droit (properties) | VS Code |
| `Ctrl+Shift+E` | Focus palette search | VS Code Explorer |
| `Delete` | Supprimer nœud/edge sélectionné | @xyflow natif |
| `Ctrl+Z` | Undo (Phase 2) | Universel |
| `Ctrl+S` | Sauvegarder pipeline | Universel |
| `Ctrl+Shift+P` | Command palette (Phase 2) | VS Code |
| `Escape` | Désélectionner tout | @xyflow natif |
| `?` | Ouvrir tutoriel | VAD-specific |

```typescript
// useKeyboardShortcuts.ts (hook dédié)
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      toggleLeftPanel();
    }
    if (e.ctrlKey && e.key === 'j') {
      e.preventDefault();
      toggleRightPanel();
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      savePipeline();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [toggleLeftPanel, toggleRightPanel, savePipeline]);
```

#### Persistence des layouts (localStorage)

```typescript
// autoSaveId="vad-layout" dans PanelGroup = persistence automatique
// react-resizable-panels gère nativement via localStorage
// Clés : "react-resizable-panels:vad-layout"
```

#### Status Bar (F20)

```tsx
// StatusBar.tsx — barre 32px en bas
<Box component="footer" sx={{
  height: 32,
  bgcolor: 'var(--color-surface-alt)',
  borderTop: '1px solid var(--color-border)',
  display: 'flex',
  alignItems: 'center',
  px: 2,
  gap: 3,
  fontSize: 'var(--font-size-xs)',
  color: 'var(--color-text-secondary)',
}}>
  <span>Nœuds: {nodeCount}</span>
  <span>Connexions: {edgeCount}</span>
  <span>Explain: {lastLatency ? `${lastLatency}ms` : '—'}</span>
  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Circle sx={{ fontSize: 8, color: isConnected ? '#4CAF50' : '#F44336' }} />
    <span>{isConnected ? 'Connecté' : 'Hors ligne'}</span>
  </Box>
</Box>
```

---

### F. DIFFÉRENCIATION MARCHÉ — Éviter les pièges des outils du moment

#### Analyse des outils à éviter de cloner

| Outil | Pattern typique | Ce qu'il manque | Notre différence |
|-------|----------------|-----------------|-----------------|
| **Base44** | Box générique + form CRUD blanc | Aucun contexte domaine, pas d'animation, interface plate | Nœuds ML conscients de leur domaine, thème sombre cosmique |
| **OpenClaw** | Workflow rectangles + arrows + config sidebar | Generic, pas d'IA intégrée, UX 2015 | AI explanation inline, palette thématique |
| **Hermes** | Agent builder, blocs colorés basiques | Requiert compte, focus LLM uniquement, pas de ML statistique | Accès anonyme, catalogue H2O statistique + DL |
| **Mercury (mljar)** | Notebook → webapp, sidebar widgets | Pas visuel pipeline, pas drag-drop nodes | Interface canvas pipeline, drag-drop natif |
| **n8n** | Workflow automation, centré intégrations | Pas ML, pas paramètres statistiques, trop technique | Focus éducatif ML, paramètres documentés inline |
| **Orange3** | Visual ML desktop app Python | Desktop non-web, UI 2010, aucune animation, pas d'IA | Web-native, dark cosmic, AI explanation, animations |

#### Les 6 différenciateurs VAD non-copiables en 1 sprint

1. **Thème cosmique sombre** — Immédiatement distinct de 100% des concurrents qui sont blancs/gris. Première impression mémorable. `--color-surface: #1A1B2E`, `--color-primary: #3D8A88`.

2. **Nœuds ML contextuels** — Chaque nœud connaît sa catégorie (Supervised/Unsupervised/AutoML), ses paramètres par défaut H2O réels, et sa couleur. Pas un bloc générique renommé "GBM".

3. **AI Explanation inline** — L'explication Groq/Llama apparaît dans l'interface, pas dans une fenêtre externe. "Pourquoi GBM → GLM dans ce pipeline ?" directement visible.

4. **Paramètres H2O documentés inline** — Dans le PropertiesPanel, chaque paramètre affiche sa description RST extraite de h2o-3. Pas de lien externe, pas de documentation séparée.

5. **Excel workbook intégré** — Export en 1 clic d'un workbook structuré pour documenter ses expériences. Bridge avec l'outillage académique existant.

6. **Zéro login en Phase 1** — Core loop fonctionnel sans compte. Réduction du friction maximal. Mercury exige un deploy, Base44 exige un compte, Orange3 exige Python installé.

#### Ce que nous NE faisons PAS (pour ne pas copier le mauvais pattern)

```
❌ Pas de sidebar à onglets multiples comme n8n (complexité de navigation)
❌ Pas de marketplace de plugins dès Phase 1 (scope creep)
❌ Pas de collaboration temps-réel dès Phase 1 (overkill, @xyflow Pro)
❌ Pas de light mode dès Phase 1 (effort double de design)
❌ Pas d'export PNG/SVG dès Phase 1 (utile mais pas dans core loop)
❌ Pas de version history UI dès Phase 1 (complexity)
```

---

### G. ALTERNATIVES À H2O — Analyse comparative bibliothèques

#### Pourquoi rester sur H2O pour le catalogue

| Critère | H2O.ai | scikit-learn | MLflow | Orange3 | PyCaret | Weka |
|---------|--------|-------------|--------|---------|---------|------|
| Documentation paramètres en RST/structurée | ✅ GitHub RST | ✅ docstrings Python | ❌ tracking only | ✅ XML schemas | ⚠️ README | ✅ Java Javadoc |
| Licence scraping | ✅ Apache 2.0 | ✅ BSD-3 | ✅ Apache 2.0 | ✅ GPL-3 | ✅ MIT | ⚠️ GPL-3 |
| Couverture algorithmes ML | ✅ 25+ algos | ✅ 50+ algos | ❌ (pas d'algos) | ✅ 20+ | ✅ 30+ | ✅ 40+ |
| Format param exploitable | ✅ RST structuré | ⚠️ Docstrings Python (variable) | N/A | ⚠️ XML interne | ⚠️ README | ⚠️ XML |
| Facilité d'extraction | ✅ `raw.githubusercontent.com` | ⚠️ Sphinx autodoc | N/A | ❌ Pas de format central | ❌ Dispersé | ❌ Complexe |
| Audience cible (éducation) | ✅ AutoML académique | ✅ Cours ML universel | ❌ DataOps | ✅ Académique | ⚠️ Compétition ML | ✅ Académique |

**Conclusion : H2O reste le meilleur choix** pour sa documentation RST structurée et accessible via GitHub raw URLs. Toutefois, une **extension Phase 2 avec scikit-learn** est envisageable via extraction des docstrings Python avec `ast.parse()`.

#### Orange3 — Analyse détaillée (concurrent direct)

- **GitHub :** https://github.com/biolab/orange3 — 5k stars, actif, Python/Qt desktop
- **Interface :** Canvas visual drag-drop (widgets = nœuds), connexions entre widgets
- **Forces :** Large catalogue, documenté, académique
- **Faiblesses critiques :**
  - Desktop uniquement (PyQt5) — pas de web
  - UX datée (2010-style, flat gray, aucune animation)
  - Aucune IA explicative intégrée
  - Installation Python requise (barrière pour non-tech)
  - Pas de thème sombre
- **Ce qu'on emprunte :** Métaphore "widget = algorithm node with inputs/outputs"
- **Ce qu'on améliore :** Web-native, dark, AI, animations, Excel export

#### Scikit-learn — Potentiel Phase 2

```typescript
// Futur: services/sklearnCatalog.ts
// Source: https://scikit-learn.org/stable/modules/classes.html
// Extraction: fetch HTML + parser les paramètres depuis les docstrings
// ~50 estimateurs → GradientBoostingClassifier, RandomForestClassifier, SVC, KMeans...
// Avantage: couverture universelle, reconnu dans tous les cours ML
```

---

### H. ANNEXE — SCRAPING RST H2O GITHUB

#### Approche validée

```
URL pattern: https://raw.githubusercontent.com/h2oai/h2o-3/master/h2o-docs/src/product/data-science/algo-params/{param}.rst
Status: ✅ Confirmé fonctionnel (alpha.rst testé et contenu extrait)
Licence: Apache 2.0 — usage éducatif et attribution permis
```

#### Script de scraping — F19

```javascript
// scripts/scrape-h2o-params.js (Node.js, exécuté une fois en dev)
// Produit: src/data/h2oParams/{param}.json

const BASE_URL = 'https://raw.githubusercontent.com/h2oai/h2o-3/master/h2o-docs/src/product/data-science/algo-params';

// Format RST → JSON extraction
function parseRST(content, paramName) {
  const result = {
    name: paramName,
    availableIn: [],
    hyperparameter: false,
    description: '',
    relatedParams: [],
    defaultValue: null,
  };

  // Available in: "GLM, GBM, DRF"
  const availMatch = content.match(/Available in:\s*([^\n]+)/);
  if (availMatch) {
    result.availableIn = availMatch[1].split(',').map((s) => s.trim());
  }

  // Hyperparameter: "Y" or "N"
  const hyperMatch = content.match(/Hyperparameter:\s*([YN])/i);
  if (hyperMatch) {
    result.hyperparameter = hyperMatch[1].toUpperCase() === 'Y';
  }

  // Description: texte entre "Description" et "Related Parameters" ou "Example"
  const descMatch = content.match(/Description\n[-=]+\n([\s\S]*?)(?:\nRelated Parameters|\nExample)/);
  if (descMatch) {
    result.description = descMatch[1].trim().replace(/\s+/g, ' ');
  }

  // Related parameters: "- `lambda`_\n- `solver`_\n"
  const relatedMatch = content.match(/Related Parameters\n[-=]+\n([\s\S]*?)(?:\nExample|$)/);
  if (relatedMatch) {
    const matches = relatedMatch[1].matchAll(/`([^`]+)`_/g);
    result.relatedParams = Array.from(matches, (m) => m[1]);
  }

  return result;
}
```

#### Liste complète des RST à scraper (Lot 1 — 30 paramètres prioritaires)

Les 30 paramètres les plus utilisés pour les 6 algorithmes du Lot 1 :

```
alpha, balance_classes, col_sample_rate, col_sample_rate_per_tree,
distribution, early_stopping, family, fold_column, ignore_const_cols,
k, keep_cross_validation_models, lambda, lambda_search, learn_rate,
learn_rate_annealing, max_depth, max_models, max_runtime_secs,
min_rows, missing_values_handling, mtries, nbins, nfolds, ntrees,
sample_rate, seed, sort_metric, standardize, stopping_metric, stopping_rounds
```

**Lot 2 (Phase 2) :** Les 80+ paramètres restants de la liste complète fournie.

#### Intégration dans algorithmCatalog.ts

```typescript
// Après scraping, les JSON sont importés statiquement
// services/algorithmCatalog.ts

import alphaParam from '../data/h2oParams/alpha.json';
import ntreesParam from '../data/h2oParams/ntrees.json';
// ...

export const H2O_PARAMS: Record<string, H2OParamDef> = {
  alpha: alphaParam,
  ntrees: ntreesParam,
  // ...
};

// Chaque AlgorithmNode référence ses paramètres par nom
export const GBM_ALGORITHM: AlgorithmDef = {
  id: 'gbm',
  name: 'Gradient Boosting Machine',
  category: 'supervised',
  params: ['ntrees', 'max_depth', 'learn_rate', 'sample_rate', 'col_sample_rate'],
};
```

---

### Nouvelles Tâches Phase 7-2 (suite de la série F)

- [ ] F14. Installer `xlsx` (SheetJS) dans `ReaAaS-N-frontend/package.json` — `npm install xlsx`
- [ ] F15. Créer `services/workbookExporter.ts` — generateWorkbook() avec templates Lot 1
- [ ] F16. Créer `components/AlgorithmDesigner/TutorialOverlay.tsx` — 5 étapes réactives
- [ ] F17. Installer `react-resizable-panels` — `npm install react-resizable-panels`
- [ ] F18. Créer `hooks/useKeyboardShortcuts.ts` — Ctrl+B, Ctrl+J, Ctrl+S
- [ ] F19. Créer `scripts/scrape-h2o-params.js` — scraping RST → JSON (exécuté une fois)
- [ ] F20. Créer `components/AlgorithmDesigner/StatusBar.tsx` — nodeCount, edgeCount, latency
- [ ] F21. Ajouter section `/* === ANIMATIONS === */` dans `palette.css` — nodeDropIn, handlePulse, drawEdge, textFadeIn, rippleOut

---

### Stack — Validations Complémentaires Phase 7-2 (26 avril 2026)

| Décision | Validation | Source |
|----------|------------|--------|
| SheetJS (xlsx) pour export Excel | ✅ 35k stars, Apache 2.0, client-side, tree-shakeable | npmjs.com |
| react-resizable-panels pour panels redimensionnables | ✅ 3.5k stars, MIT, zero deps, autoSave localStorage | github.com/bvaughn |
| Tutoriel contextuel (custom) vs Shepherd.js | ✅ Custom léger préféré — pas de 15kB dépendance externe | decision locale |
| CSS @keyframes pour toutes les animations | ✅ 0 lib JS animation (Framer Motion overkill pour MVP) | perf budget |
| SVG `<animateMotion>` pour effet connexion | ✅ Native SVG, 0 lib, compatible @xyflow BaseEdge | xyflow docs |
| H2O RST scraping via raw.githubusercontent.com | ✅ Confirmé fonctionnel, Apache 2.0 | test live |
| Orange3 étudié comme concurrent direct | ✅ Analysé: web-native + AI = différenciateurs absents chez Orange3 | github.com/biolab |
| Scikit-learn en catalogue Phase 2 (pas Phase 1) | ✅ Scope Phase 1 = H2O seulement, extension planifiée | singularité Phase 1 |

**Décisions nouvelles IRRÉVERSIBLES Phase 7-2 :**
- SheetJS (xlsx) = librairie Excel client — pas de génération backend
- Tutoriel = état local dans AlgorithmDesignerPage, pas de store global
- `react-resizable-panels` = Phase 1 optionnel (fallback CSS Grid fixe acceptable pour MVP)
- Animations = CSS keyframes dans palette.css — jamais Framer Motion en Phase 1
- Script scraping RST = exécuté une seule fois en dev, résultat committé en JSON statique

---

## PHASE 7-3 — AZ-FRONTEND : MÉMOIRE IA, PRÉVENTION DES BOUCLES ET SYSTÈME RAG

> Date analyse : 26 avril 2026  
> Contexte : Troisième couche d'analyse frontend. Couvre l'architecture mémoire pour l'agent IA, le mécanisme anti-boucle (loopback guard), l'évaluation de 4 approches (OpenClaw/Hermes, Codex, VS Code, custom), le choix du système RAG, et l'alimentation du backend mémoire.

---

### A. CLARIFICATION — LoopBack Next vs Loopback Mechanism

Le lien fourni ([github.com/loopbackio/loopback-next](https://github.com/loopbackio/loopback-next)) pointe vers **LoopBack 4** — un framework REST API TypeScript d'IBM (5.1k stars, MIT, actif). Ce n'est **pas** un système de mémoire IA.

**Ce que LoopBack Next EST :**
- Framework Node.js/TypeScript pour construire des APIs REST
- Système IoC/DI (Inversion of Control) avec `@inject`, `@bind`, `Context`
- Pattern Repository pour la persistance (LoopBack Repository = interface générique)
- Intercepteurs de requêtes (Request Interceptor Chain)

**Ce que LoopBack Next N'EST PAS :**
- Un système de mémoire IA
- Un garde anti-boucle pour agents
- Un framework RAG

**Décision concernant LoopBack Next :**

| Question | Réponse |
|----------|---------|
| Remplacer Express par LoopBack 4 ? | ❌ — Refactoring massif, risque B-series, Express déjà en stack |
| Utiliser LoopBack 4 comme inspiration architecturale ? | ✅ — Ses patterns IoC, intercepteurs, et Repository sont excellents à copier |
| Utiliser LoopBack 4 dans Phase 2 si backend devient complexe ? | ✅ — Option viable si l'API dépasse 15 endpoints |

**Ce qu'on emprunte de LoopBack sans l'adopter :**
1. Pattern **Context Interceptor** → implémenté comme middleware Express pour logger chaque appel IA
2. Pattern **Repository** → `MemoryRepository` interface générique pour découpler le stockage
3. Pattern **Service Binding** → `memoryService` injecté comme propriété dans le router Express

---

### B. SCHÉMA LOOPBACK — Mécanisme anti-boucle pour l'agent IA

#### Le problème : Boucles infinies dans les pipelines IA

Sans garde, un agent IA (Groq + Llama) peut appeler la même fonction à l'infini :

```
Appel 1: explainGBM("ntrees=100") → "Appelle aussi explainGBM pour ntrees=50"
Appel 2: explainGBM("ntrees=50")  → "Appelle aussi explainGBM pour ntrees=100"
→ BOUCLE INFINIE → Erreur Groq rate limit + UX bloquée
```

#### Solution : Visited-Set + Iteration Cap (pattern ReAct guard)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AI PIPELINE CALL FLOW                             │
│                                                                      │
│  Frontend                 Express                  Groq              │
│  ─────────                ───────                  ────              │
│  [Explain] ──POST────────→ /api/ai/explain-pipeline                 │
│                               │                                      │
│                         ┌─────▼──────────────────────────────┐     │
│                         │   AIPipelineService                 │     │
│                         │                                     │     │
│                         │  callStack = new Set<string>()      │     │
│                         │  iteration = 0                      │     │
│                         │  MAX_ITER = 5                       │     │
│                         │                                     │     │
│                         │  ┌─────────────────────────────┐   │     │
│                         │  │  LOOP                       │   │     │
│                         │  │  ──────                     │   │     │
│                         │  │  1. Build prompt + memories  │   │     │
│                         │  │  2. Call Groq ─────────────────────→  │
│                         │  │                             │   │     │
│                         │  │  3. Groq returns toolCall ? │   │←───  │
│                         │  │     ↓ YES                   │   │     │
│                         │  │  4. funcKey = name+args     │   │     │
│                         │  │  5. callStack.has(funcKey)? │   │     │
│                         │  │     ↓ YES → BREAK (loop!)   │   │     │
│                         │  │     ↓ NO  → callStack.add   │   │     │
│                         │  │  6. Execute tool            │   │     │
│                         │  │  7. iteration++             │   │     │
│                         │  │  8. iteration >= MAX? BREAK │   │     │
│                         │  └─────────────────────────────┘   │     │
│                         │                                     │     │
│                         │  9. Save to MemoryService           │     │
│                         └─────────────────────────────────────┘     │
│                               │                                      │
│  ←──────────────────── response { explanation, memories }           │
└─────────────────────────────────────────────────────────────────────┘
```

#### Implémentation — `services/aiPipelineService.ts` (backend)

```typescript
// ReaAaS-N-backend/services/aiPipelineService.ts

interface PipelineCall {
  name: string;
  args: Record<string, unknown>;
}

const MAX_ITERATIONS = 5;

export async function explainPipeline(
  pipeline: AlgorithmNode[],
  userId: string,
  memoryService: MemoryRepository
): Promise<{ explanation: string; iterationsUsed: number }> {

  // 1. Récupérer les souvenirs pertinents
  const memories = await memoryService.search(
    `pipeline ${pipeline.map((n) => n.algorithmId).join(' ')}`,
    userId
  );

  // 2. Construire le prompt avec les souvenirs
  const systemPrompt = buildSystemPrompt(memories);
  const userPrompt = buildPipelinePrompt(pipeline);

  // 3. Garde anti-boucle
  const callStack = new Set<string>();
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let iteration = 0;
  let finalExplanation = '';

  while (iteration < MAX_ITERATIONS) {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      tools: PIPELINE_TOOLS, // outils disponibles (getAlgoDetails, compareAlgos...)
    });

    const choice = response.choices[0];

    // Pas de tool call = réponse finale
    if (!choice.message.tool_calls?.length) {
      finalExplanation = choice.message.content ?? '';
      break;
    }

    // Traitement des tool calls
    for (const toolCall of choice.message.tool_calls) {
      const funcKey = `${toolCall.function.name}:${toolCall.function.arguments}`;

      // GARDE ANTI-BOUCLE : même appel détecté → arrêt propre
      if (callStack.has(funcKey)) {
        finalExplanation = buildFallbackExplanation(pipeline, messages);
        iteration = MAX_ITERATIONS; // Force la sortie
        break;
      }

      callStack.add(funcKey);
      const toolResult = await executeToolCall(toolCall);

      messages.push(
        { role: 'assistant', content: null, tool_calls: [toolCall] },
        { role: 'tool', tool_call_id: toolCall.id, content: toolResult }
      );
    }

    iteration++;
  }

  // 4. Sauvegarder en mémoire
  await memoryService.add(userId, {
    pipeline: pipeline.map((n) => n.algorithmId),
    explanation: finalExplanation,
    timestamp: Date.now(),
  });

  return { explanation: finalExplanation, iterationsUsed: iteration };
}
```

---

### C. SYSTÈME MÉMOIRE — Évaluation des 4 approches

#### Approche 1 : Pattern OpenClaw / Hermes

**Comment OpenClaw/Hermes gèrent la mémoire :**
- Actions de l'agent enregistrées dans une DB relationnelle (historique linéaire)
- Mémoire = liste ordonnée de (action, résultat) injectée en début de prompt
- Déduplication : simple hash de l'action, skip si déjà vu dans la session
- Pas de vectorisation, pas de sémantique — simple lookup exact

| Aspect | OpenClaw/Hermes | Pour VAD |
|--------|----------------|---------|
| Complexité | Faible | ✅ Bon |
| Pertinence retrieval | Faible (lookup exact) | ❌ Manque de sémantique |
| Persistance multi-session | Variable | ❌ Souvent session-only |
| Différenciation | Médiocre UX répétitive | ❌ L'utilisateur repose les mêmes questions |

**Verdict : Éviter** — Pas de vraie mémoire sémantique, utilisateur se répète.

---

#### Approche 2 : Pattern Codex App (OpenAI)

**Comment Codex gère la mémoire :**
- Stateless per call — tout le contexte (fichiers workspace, historique) est envoyé à chaque appel
- Pas de persistance cross-session native (version de base)
- Compression via summary: quand le contexte dépasse la fenêtre, un résumé est généré
- Fort sur le contexte workspace (fichiers) — faible sur l'historique utilisateur long terme

| Aspect | Codex | Pour VAD |
|--------|-------|---------|
| Complexité | Très faible | ✅ |
| Coût tokens | Très élevé | ❌ Groq free tier limité (14,400 RPD) |
| Mémoire long terme | ❌ Absente | ❌ |
| Personnalisation | Faible | ❌ |

**Verdict : Éviter** — Coût tokens prohibitif avec Groq free tier. Pas de mémoire persistante.

---

#### Approche 3 : Pattern VS Code (GitHub Copilot Chat)

**Comment Copilot Chat gère la mémoire :**
- Conversation window = contexte de session (4K–16K tokens selon modèle)
- Workspace context = fichiers ouverts, symboles détectés (pas de mémoire user)
- Mémoire cross-session = absente (chaque chat démarre vierge)
- `copilot-instructions.md` = mémoire statique pré-définie (pas dynamique)

| Aspect | VS Code Copilot | Pour VAD |
|--------|----------------|---------|
| Contexte session | Bon (rolling window) | ✅ À copier |
| Mémoire long terme user | ❌ Absente | ❌ |
| Accès workspace (fichiers) | ✅ Fort | N/A (notre workspace = pipelines, pas code) |
| Personnalisation | Faible | ❌ |

**Ce qu'on emprunte du pattern VS Code :**
- **Rolling window** de la session courante → `sessionMessages[]` dans le service
- **Instructions statiques** (`copilot-instructions.md` pattern) → `systemPrompt` construit depuis H2O param docs + user prefs
- Pas le reste.

**Verdict : Emprunter le rolling window, rejeter le reste.**

---

#### Approche 4 : Solution custom (notre recommandation)

**Architecture recommandée pour VAD Phase 1 :**

```
Mémoire légère 100% Node.js :
  - Stockage : SQLite via better-sqlite3 (0 Python, 0 Docker, 0 infra)
  - Recherche : MiniSearch (BM25 text search, pure JS, 6kB gzip)
  - Structure : 3 tables (user_memories, session_context, pipeline_history)
  - API : MemoryRepository interface (swappable → Mem0 en Phase 2)
```

Pas de dépendance externe gérée, pas de Python, tourne sur Express immédiatement.

---

### D. COMPARAISON DES SYSTÈMES DE MÉMOIRE IA

| Système | Stars | Licence | SDK JS/TS | Self-host | Coût | MVP fit |
|---------|-------|---------|-----------|-----------|------|---------|
| **Mem0 OSS** | 54k | Apache 2.0 | ✅ `npm install mem0ai` | ✅ Docker | Gratuit OSS | ✅ Phase 2 |
| **Zep Cloud** | 4.5k | Apache 2.0 | ✅ `@getzep/zep-cloud` | ❌ Cloud only | Free tier | ✅ Phase 2 |
| **LangChain.js** | 13k | MIT | ✅ `@langchain/core` | ✅ | Gratuit | ⚠️ Lourd |
| **Custom SQLite+MiniSearch** | N/A | MIT | ✅ natif Node.js | ✅ | Gratuit | ✅ **Phase 1** |
| **Pinecone** | — | Propriétaire | ✅ | ❌ Cloud | $70/mo | ❌ Overkill |

#### Pourquoi Mem0 pour Phase 2 (pas Phase 1)

**Mem0** (54k stars, YC S24, actif — dernière release il y a 13h au 26 avril 2026) :
- `npm install mem0ai` — SDK TypeScript disponible
- Multi-level memory : User (cross-session) + Session + Agent state
- Algorithme April 2026 : 93.4% accuracy sur LongMemEval
- Self-hosted via Docker : `cd server && docker compose up -d`
- Intègre avec OpenAI, Groq, Anthropic, Ollama

**Pourquoi Phase 2 :** nécessite Docker pour le self-hosted ou une clé API cloud. Pour Phase 1 MVP sur machine locale, notre SQLite+MiniSearch suffit et respecte le principe "boring technology".

#### Pourquoi Zep pour Phase 2 (option alternative Mem0)

**Zep** (getzep.com) :
- Temporal knowledge graph (Graphiti, open source)
- <200ms P95 retrieval latency
- `npm install @getzep/zep-cloud`
- TypeScript/Python/Go SDKs
- Mais : Community Edition dépréciée — cloud only pour la vraie version

**Verdict Phase 2 :** Mem0 OSS préféré à Zep pour self-hosted. Zep Cloud si on veut temporal graph sans infra.

---

### E. ARCHITECTURE MÉMOIRE PHASE 1 — SQLite + MiniSearch

#### Structure de données

```
ReaAaS-N-backend/
  data/
    memory.db          ← SQLite database (gitignore'd)
  services/
    memoryRepository.ts  ← Interface + SQLite impl
    aiPipelineService.ts ← Agent avec loopback guard
```

#### Schéma SQLite (3 tables)

```sql
-- Mémoires persistantes par utilisateur
CREATE TABLE user_memories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL,          -- 'anonymous' ou UUID session
  content     TEXT NOT NULL,          -- fait mémorisé en langage naturel
  category    TEXT NOT NULL,          -- 'pipeline_pref' | 'algo_param' | 'feedback'
  created_at  INTEGER NOT NULL,       -- Unix timestamp
  access_count INTEGER DEFAULT 0     -- pour scoring de pertinence
);
CREATE INDEX idx_user_memories_user ON user_memories(user_id);

-- Contexte de session courante (TTL 24h)
CREATE TABLE session_context (
  session_id  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  messages    TEXT NOT NULL,          -- JSON array de { role, content }
  pipeline    TEXT,                   -- JSON du dernier pipeline expliqué
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL        -- created_at + 86400000
);

-- Historique des pipelines expliqués
CREATE TABLE pipeline_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT NOT NULL,
  pipeline_json TEXT NOT NULL,        -- JSON array d'AlgorithmNode
  explanation TEXT NOT NULL,
  latency_ms  INTEGER,
  created_at  INTEGER NOT NULL
);
CREATE INDEX idx_pipeline_history_user ON pipeline_history(user_id);
```

#### MemoryRepository interface (swappable)

```typescript
// services/memoryRepository.ts
export interface MemoryRepository {
  // Ajouter un souvenir persistant
  add(userId: string, memory: MemoryEntry): Promise<void>;

  // Recherche sémantique/BM25 dans les souvenirs
  search(query: string, userId: string, topK?: number): Promise<MemoryEntry[]>;

  // Sauvegarder contexte session
  saveSession(sessionId: string, userId: string, messages: Message[]): Promise<void>;

  // Récupérer contexte session
  getSession(sessionId: string): Promise<SessionContext | null>;

  // Historique pipelines
  savePipeline(userId: string, pipeline: AlgorithmNode[], explanation: string, latencyMs: number): Promise<void>;
  getPipelineHistory(userId: string, limit?: number): Promise<PipelineHistoryEntry[]>;
}
```

#### SQLiteMemoryRepository (implémentation Phase 1)

```typescript
// services/sqliteMemoryRepository.ts
import Database from 'better-sqlite3';
import MiniSearch from 'minisearch';

export class SQLiteMemoryRepository implements MemoryRepository {
  private db: Database.Database;
  private index: MiniSearch;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initSchema();
    this.index = new MiniSearch({
      fields: ['content', 'category'],
      storeFields: ['id', 'user_id', 'content', 'category', 'created_at'],
    });
    this.loadIndex();
  }

  async add(userId: string, memory: MemoryEntry): Promise<void> {
    const stmt = this.db.prepare(
      'INSERT INTO user_memories (user_id, content, category, created_at) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(userId, memory.content, memory.category, Date.now());

    // Mise à jour de l'index MiniSearch en mémoire
    this.index.add({ id: result.lastInsertRowid, ...memory, user_id: userId });
  }

  async search(query: string, userId: string, topK = 5): Promise<MemoryEntry[]> {
    const results = this.index.search(query, {
      filter: (result) => result.user_id === userId,
    });
    return results.slice(0, topK).map((r) => ({
      content: r.content,
      category: r.category,
      createdAt: r.created_at,
    }));
  }
}
```

#### Packages à installer (backend)

```bash
cd ReaAaS-N-backend
npm install better-sqlite3 minisearch
npm install --save-dev @types/better-sqlite3
```

| Package | Stars | Licence | Taille | Rôle |
|---------|-------|---------|--------|------|
| `better-sqlite3` | 6.2k | MIT | 0 dep | SQLite synchrone, performant |
| `minisearch` | 4.5k | MIT | 6kB gzip | BM25 text search, 0 dep, pure JS |

---

### F. SCHÉMA RAG COMPLET — Comment le backend alimente la mémoire

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FLUX MÉMOIRE COMPLET VAD                          │
│                                                                      │
│  FRONTEND                                                            │
│  ──────────────────────────────────────────────────────────────────  │
│  Utilisateur :                                                       │
│  [Drag GBM] → [Connect → GLM] → [Explain] → [Feedback 👍]          │
│                    │                │                │               │
│                    │                │                │               │
│  BACKEND : Express                                                   │
│  ──────────────────────────────────────────────────────────────────  │
│                    │                │                │               │
│     WRITE ─────────┼────────────────┼────────────────┘               │
│                    ▼                ▼                                 │
│           pipeline_history    user_memories                          │
│           (chaque explain)    (préférences,                          │
│                               feedbacks)                             │
│                                                                      │
│     READ ─────────────────────────────────────────────────────────── │
│                    │                                                  │
│            AIPipelineService                                         │
│                    │                                                  │
│           1. search(query, userId) ── MiniSearch BM25 ──→ top 5      │
│           2. Build context :                                         │
│              "User previously preferred GBM with ntrees=200          │
│               User gave 👍 to GBM→RF pipeline"                      │
│           3. Inject in systemPrompt                                  │
│           4. Call Groq (avec loopback guard, MAX 5 iterations)       │
│           5. Save explanation + pipeline                             │
│                    │                                                  │
│            ←── { explanation, memories_used, iterations }           │
│                                                                      │
│  FRONTEND                                                            │
│  ──────────────────────────────────────────────────────────────────  │
│  AIExplanationPanel affiche :                                        │
│  - Explication générée                                               │
│  - Badges "Basé sur vos 3 derniers pipelines"                        │
│  - Bouton 👍/👎 (feedback → write en mémoire)                        │
└──────────────────────────────────────────────────────────────────────┘
```

#### Les 3 types de mémoire dans VAD

| Type | Stockage | Durée | Contenu |
|------|----------|-------|---------|
| **User Memory** | SQLite `user_memories` | Persistant | Préférences params, algos favoris, feedbacks |
| **Session Memory** | SQLite `session_context` (TTL 24h) | Session | Messages échangés, pipeline en cours |
| **Pipeline History** | SQLite `pipeline_history` | Persistant | Pipelines expliqués + résultats |

#### Alimentation automatique des souvenirs

Le backend extrait automatiquement des faits mémorisables depuis les interactions :

```typescript
// Après chaque appel explain-pipeline réussi
function extractMemoriesToSave(
  pipeline: AlgorithmNode[],
  explanation: string,
  userFeedback?: 'positive' | 'negative'
): MemoryEntry[] {
  const memories: MemoryEntry[] = [];

  // Fait 1 : Pipeline utilisé
  memories.push({
    content: `User built pipeline: ${pipeline.map((n) => n.algorithmId).join(' → ')}`,
    category: 'pipeline_pref',
  });

  // Fait 2 : Paramètres utilisés (s'ils diffèrent des défauts H2O)
  pipeline.forEach((node) => {
    const nonDefaultParams = getModifiedParams(node);
    if (nonDefaultParams.length > 0) {
      memories.push({
        content: `User set ${node.algorithmId} params: ${nonDefaultParams.join(', ')}`,
        category: 'algo_param',
      });
    }
  });

  // Fait 3 : Feedback utilisateur
  if (userFeedback) {
    memories.push({
      content: `User rated ${pipeline.map((n) => n.algorithmId).join('→')} pipeline as ${userFeedback}`,
      category: 'feedback',
    });
  }

  return memories;
}
```

---

### G. COMPOSANTS FRONTEND — Mémoire visible pour l'utilisateur

L'utilisateur doit **voir** que l'IA se souvient de lui. C'est un différenciateur UX fort.

#### MemoryBadge — Dans AIExplanationPanel

```tsx
// Affiché quand des souvenirs ont été utilisés
{memoriesUsed.length > 0 && (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mt: 1,
    p: 1,
    borderRadius: 'var(--radius-sm)',
    bgcolor: 'rgba(61, 138, 136, 0.15)',  // --color-primary avec alpha
    border: '1px solid var(--color-primary)',
  }}>
    <MemoryIcon sx={{ fontSize: 14, color: 'var(--color-primary)' }} />
    <Typography variant="caption" sx={{ color: 'var(--color-primary)' }}>
      Basé sur {memoriesUsed.length} souvenir{memoriesUsed.length > 1 ? 's' : ''} de vos sessions précédentes
    </Typography>
  </Box>
)}
```

#### FeedbackButtons — Dans AIExplanationPanel

```tsx
// 👍 / 👎 envoie le feedback au backend qui le mémorise
<Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
  <IconButton
    size="small"
    onClick={() => submitFeedback('positive')}
    sx={{ color: feedbackSent === 'positive' ? '#4CAF50' : 'var(--color-text-secondary)' }}
  >
    <ThumbUpIcon fontSize="small" />
  </IconButton>
  <IconButton
    size="small"
    onClick={() => submitFeedback('negative')}
    sx={{ color: feedbackSent === 'negative' ? '#F44336' : 'var(--color-text-secondary)' }}
  >
    <ThumbDownIcon fontSize="small" />
  </IconButton>
  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', alignSelf: 'center' }}>
    {feedbackSent ? 'Mémorisé ✓' : 'Cette explication était utile ?'}
  </Typography>
</Box>
```

#### SessionId management (anonymous users)

```typescript
// services/sessionManager.ts (frontend)
export function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('vad_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('vad_session_id', sessionId);
  }
  return sessionId;
}

// Envoyé dans chaque appel API comme header
// 'X-Session-Id': getOrCreateSessionId()
// Backend l'utilise comme userId (anonymous mode Phase 1)
```

---

### H. COMPARAISON FINALE DES 4 APPROCHES

| Critère | OpenClaw/Hermes | Codex App | VS Code | **Custom (notre choix)** |
|---------|----------------|-----------|---------|--------------------------|
| Mémoire cross-session | ❌ Session only | ❌ Stateless | ❌ Session only | ✅ SQLite persistant |
| Coût tokens | Moyen | ❌ Très élevé | Moyen | ✅ Minimal (top 5 mémoires) |
| Self-hosted | Variable | ❌ Cloud | N/A | ✅ 100% local |
| Loop prevention | Basique (hash) | Aucun | N/A | ✅ Visited-set + MAX_ITER |
| Upgrade Path | ❌ Vendor lock | ❌ OpenAI | N/A | ✅ → Mem0 Phase 2 |
| Dépendances | Haute | Haute | N/A | ✅ 2 packages (better-sqlite3, minisearch) |
| Personnalisation | Faible | Nulle | Faible | ✅ Totale |
| Complexité implémentation | Faible | Très faible | N/A | Moyen |

**Verdict : Custom Phase 1 + Mem0 Phase 2.** La migration de `SQLiteMemoryRepository` vers `Mem0MemoryRepository` ne change que l'implémentation derrière l'interface `MemoryRepository` — le reste de l'app est inchangé.

---

### I. MIGRATION VERS MEM0 EN PHASE 2 (plan de migration)

```typescript
// services/mem0MemoryRepository.ts (Phase 2)
import { MemoryClient } from 'mem0ai';

export class Mem0MemoryRepository implements MemoryRepository {
  private client: MemoryClient;

  constructor() {
    // Option A : Cloud Mem0
    this.client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY });

    // Option B : Self-hosted (Docker)
    // this.client = new MemoryClient({ host: 'http://localhost:3000' });
  }

  async add(userId: string, memory: MemoryEntry): Promise<void> {
    await this.client.add(memory.content, { user_id: userId });
  }

  async search(query: string, userId: string, topK = 5): Promise<MemoryEntry[]> {
    const results = await this.client.search(query, { user_id: userId, top_k: topK });
    return results.results.map((r) => ({
      content: r.memory,
      category: 'general',
      createdAt: new Date(r.created_at).getTime(),
    }));
  }
}

// Swap en 1 ligne dans server.js :
// Phase 1 : const memory = new SQLiteMemoryRepository('./data/memory.db');
// Phase 2 : const memory = new Mem0MemoryRepository();
```

---

### Nouvelles Tâches Phase 7-3 (suite de la série F)

- [ ] F22. Installer `better-sqlite3` + `minisearch` dans `ReaAaS-N-backend/package.json`
- [ ] F23. Créer `ReaAaS-N-backend/services/memoryRepository.ts` — interface + types
- [ ] F24. Créer `ReaAaS-N-backend/services/sqliteMemoryRepository.ts` — impl SQLite+MiniSearch
- [ ] F25. Créer `ReaAaS-N-backend/services/aiPipelineService.ts` — explainPipeline avec loopback guard (MAX_ITER=5, visited-set)
- [ ] F26. Modifier `POST /api/ai/explain-pipeline` dans `server.js` pour utiliser aiPipelineService + memoryRepository
- [ ] F27. Ajouter `POST /api/memory/feedback` endpoint dans `server.js` — reçoit 👍/👎 et mémorise
- [ ] F28. Créer `services/sessionManager.ts` (frontend) — getOrCreateSessionId() via crypto.randomUUID()
- [ ] F29. Ajouter `MemoryBadge` + `FeedbackButtons` dans `AIExplanationPanel.tsx`
- [ ] F30. Créer `ReaAaS-N-backend/data/` dossier + ajouter à `.gitignore` (la DB ne se committe pas)

---

### Stack — Validations Complémentaires Phase 7-3 (26 avril 2026)

| Décision | Validation | Source |
|----------|------------|--------|
| LoopBack Next = framework API, pas système mémoire | ✅ Confirmé — 5.1k stars, TypeScript/Node.js REST framework | github.com/loopbackio |
| Mem0 OSS npm SDK disponible | ✅ `npm install mem0ai` — TypeScript 34.8%, actif, YC S24 | github.com/mem0ai, 54k stars |
| Zep Community Edition dépréciée | ✅ Confirmé — cloud only désormais | blog.getzep.com |
| better-sqlite3 synchrone (pas async) | ✅ Performance maximale pour lecture mémoire dans hot path | npmjs.com, 6.2k stars |
| MiniSearch BM25 pure JS | ✅ 4.5k stars, MIT, 6kB gzip, zéro dépendance | npmjs.com |
| Interface MemoryRepository = pattern Repository LoopBack | ✅ Découplage complet — swap SQLite → Mem0 sans toucher l'agent | pattern architectural |
| Visited-set + MAX_ITER=5 comme loopback guard | ✅ Standard ReAct agent pattern, confirmé dans littérature | Yao et al. 2022 ReAct paper |

**Décisions nouvelles IRRÉVERSIBLES Phase 7-3 :**
- `MemoryRepository` = interface obligatoire — jamais d'appel direct à SQLite depuis le router
- `userId` Phase 1 = `X-Session-Id` header (UUID localStorage) — pas d'auth
- `MAX_ITERATIONS = 5` pour le loopback guard — valeur fixe, pas configurable en Phase 1
- `better-sqlite3` synchrone (pas `sqlite3` async) — choix délibéré pour la simplicité
- Migration vers Mem0 en Phase 2 = swap d'implémentation derrière l'interface — zéro autre changement

---

## PHASE 7-4 — AZ-FRONTEND : ANALYSE FINALE — DnD CROSS-PANEL, PANEL BAS "CHANNEL RACK", GAP ANALYSIS EXHAUSTIVE ET CHECKLIST PHASE 7

> Date analyse : 26 avril 2026  
> Contexte : Quatrième et dernière couche d'analyse frontend. Répond à deux nouvelles demandes UX : (1) mécanique DnD cross-panel avec ghost image, (2) panneau bas "FL Studio-style" comme bibliothèque de pipelines préfabriqués. Effectue ensuite une re-analyse des Phases 7, 7-2, 7-3 pour identifier les lacunes, puis constitue une checklist exhaustive avant implémentation.

---

### A. MÉCANIQUE DnD CROSS-PANEL — "Click, Hold, Drag, Drop"

#### La question : Comment l'élément sélectionné dans le panneau gauche se déplace-t-il vers le canvas ?

La mécanique complète utilise l'**HTML Drag and Drop API** (native, aucune librairie additionnelle) en combinaison avec le **DnDContext** de @xyflow/react.

#### Flux complet — Du clic à la création de nœud

```
PANNEAU GAUCHE (AlgorithmPalette)
────────────────────────────────────────────────────────────────────────

1. L'utilisateur HOVER sur une carte algorithme
   → CSS: .palette-card:hover { box-shadow: 0 0 8px var(--color-primary); }
   → Curseur change en grab via cursor: grab

2. L'utilisateur MOUSEDOWN (click hold)
   → Rien ne se passe encore côté React
   → Le navigateur attend un mouvement de >5px pour déclencher le drag

3. L'utilisateur COMMENCE À DRAGGING (>5px de mouvement)
   → onDragStart se déclenche sur la carte
   → event.dataTransfer.setData('application/vad-node', JSON.stringify({
       type: algo.id,          // ex: 'gbm'
       algorithmId: algo.id,
       label: algo.label,
       category: algo.category,
     }))
   → event.dataTransfer.effectAllowed = 'copy'
   → setDragType(algo.id) dans DnDContext (React state partagé)

4. GHOST IMAGE (aperçu visuel pendant le drag)
   → Par défaut : le navigateur crée une copie semi-transparente de la carte
   → Pour personnaliser (optionnel Phase 1) :
     const dragPreview = document.getElementById('drag-preview-ghost')
     // Div caché dans le DOM, stylisé comme une carte miniature
     event.dataTransfer.setDragImage(dragPreview, 60, 20)

5. L'utilisateur TRAVERSE les panneaux
   → Passage panneau gauche → canvas centre
   → Panneau gauche : opacity 0.5 sur la carte originale (CSS :active isDragging)
   → Canvas centre : onDragEnter → classe 'canvas-drop-target' → border dashed glow

PANNEAU CENTRE (AlgorithmCanvas)
────────────────────────────────────────────────────────────────────────

6. onDragOver (se déclenche ~30 fois/seconde pendant le survol)
   → event.preventDefault()              // ← OBLIGATOIRE sinon drop refusé
   → event.dataTransfer.dropEffect = 'copy'

7. L'utilisateur RELÂCHE (drop)
   → onDrop se déclenche
   → const payload = JSON.parse(event.dataTransfer.getData('application/vad-node'))
   → const position = screenToFlowPosition({
       x: event.clientX,
       y: event.clientY,
     })
   → const newNode = {
       id: `node_${Date.now()}`,
       type: 'algorithmNode',           // type de nœud custom @xyflow
       position,
       data: {
         algorithmId: payload.algorithmId,
         label: payload.label,
         category: payload.category,
         params: getDefaultParams(payload.algorithmId),
       },
       className: 'node-drop-in',       // animation CSS
     }
   → setNodes(nds => nds.concat(newNode))

8. NETTOYAGE post-drop
   → setDragType(null) dans DnDContext
   → Retrait classe 'canvas-drop-target' du canvas
   → Classe 'node-drop-in' retirée après 250ms (setTimeout)
   → Carte originale dans palette retrouve opacity: 1
```

#### DnDContext — Implémentation

```tsx
// contexts/DnDContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DnDContextType {
  dragType: string | null;
  dragPayload: DragPayload | null;
  setDrag: (type: string, payload: DragPayload) => void;
  clearDrag: () => void;
}

interface DragPayload {
  algorithmId: string;
  label: string;
  category: string;
  isPrefab?: boolean;           // true si vient du panneau bas
  prefabNodes?: SubpipelineNode[]; // si isPrefab = true
  prefabEdges?: SubpipelineEdge[];
}

const DnDContext = createContext<DnDContextType | null>(null);

export const DnDProvider = ({ children }: { children: ReactNode }) => {
  const [dragType, setDragType] = useState<string | null>(null);
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);

  return (
    <DnDContext.Provider value={{
      dragType,
      dragPayload,
      setDrag: (type, payload) => { setDragType(type); setDragPayload(payload); },
      clearDrag: () => { setDragType(null); setDragPayload(null); },
    }}>
      {children}
    </DnDContext.Provider>
  );
};

export const useDnD = () => {
  const ctx = useContext(DnDContext);
  if (!ctx) throw new Error('useDnD must be used within DnDProvider');
  return ctx;
};
```

#### Feedback visuel pendant le drag — CSS

```css
/* palette.css — section DRAG STATES */

/* Carte en cours de drag : opacity réduite */
.palette-card[data-dragging='true'] {
  opacity: 0.45;
  transform: scale(0.97);
  transition: opacity 0.1s, transform 0.1s;
}

/* Canvas quand une carte est survolée */
.react-flow__renderer.canvas-drop-target {
  outline: 2px dashed var(--color-primary);
  outline-offset: -4px;
  background: radial-gradient(
    ellipse at center,
    rgba(61, 138, 136, 0.06) 0%,
    transparent 70%
  );
}

/* Nœud qui vient d'être dropped — animation burst */
@keyframes nodeDropIn {
  0%   { transform: scale(0.6); opacity: 0; }
  70%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1.0); opacity: 1; }
}
.node-drop-in {
  animation: nodeDropIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

#### Support tactile — Pointer Events (Phase 1.5)

L'HTML DnD API ne fonctionne pas sur mobile/tactile. Solution Phase 1.5 :

| Approche | Effort | Support |
|----------|--------|---------|
| **Neodrag** (github.com/puruvj/neodrag) | Faible — 1.2k stars, MIT | Mouse + Touch + Pointer |
| **Pointer Events manuels** | Moyen — `onPointerDown/Move/Up` | Mouse + Touch |
| **react-dnd + touch backend** | Élevé — lourd | Mouse + Touch |

**Décision Phase 1 :** HTML DnD API (desktop only, acceptable pour MVP éducatif desktop). **Phase 1.5 :** Ajouter `Neodrag` si retour mobile signalé.

#### Piège à éviter — `ReactFlowProvider` obligatoire

`screenToFlowPosition` ne fonctionne que si `AlgorithmCanvas` est un enfant de `ReactFlowProvider`. La hiérarchie requise :

```tsx
// AlgorithmDesignerPage.tsx
<ReactFlowProvider>
  <DnDProvider>
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AlgorithmPalette />        {/* panneau gauche */}
      <AlgorithmCanvas />         {/* panneau centre — contient ReactFlow */}
      <AlgorithmPropertiesPanel /> {/* panneau droit */}
    </Box>
    <SubpipelineLibraryPanel />   {/* panneau bas — NOUVEAU Phase 7-4 */}
  </DnDProvider>
</ReactFlowProvider>
```

---

### B. PANNEAU BAS — "CHANNEL RACK" = SubpipelineLibraryPanel

#### Analogie FL Studio confirmée par recherche

FL Studio (Image-Line) **Channel Rack** UX pattern (source primaire: image-line.com/fl-studio, 26 avril 2026) :
- Panneau horizontal en bas de l'interface
- Chaque "channel" = un instrument (bloc réutilisable)
- Patterns = séquences sauvegardées réutilisables à volonté
- Mixer = où les instruments se connectent et interagissent
- Le Channel Rack est le "starter pack" — tu y choisis tes instruments avant de mixer

**Notre adaptation VAD :**

| FL Studio | VAD |
|-----------|-----|
| Channel Rack (panneau bas) | SubpipelineLibraryPanel (panneau bas) |
| Instrument individuel | AlgorithmCard dans palette gauche |
| Pattern pré-rempli | SubpipelineTemplate (prefab multi-nœuds) |
| Mixer | Canvas @xyflow/react |
| Step Sequencer | AlgorithmBuilderPage (étapes manuelles) |
| "Enter the mix" | "Drop the prefab on canvas" |

**Autres références confirmées :**
- **Node-RED** (Flow Library, 5000+ flows) — concept de bibliothèque de flows partageables ✅
- **Rete.js** (12k stars, MIT) — framework node-based avec concept de groupes de nœuds ✅
- **React-Diagrams** (9.4k stars, MIT) — inspiré Blender/LabView/Unreal Engine, supporte les "node groups" ✅
- **Grasshopper (Rhino3D)** — Compound components : groupes de nœuds encapsulés comme blocs réutilisables ✅

#### Layout révisé — 4 zones

```
┌──────────────────────────────────────────────────────────────────────────┐
│  AppBar — "VAD" [Builder] [Designer] [Circuit]                 [?] [⚙]  │
├──────────────┬───────────────────────────────────┬───────────────────────┤
│  PALETTE     │            CANVAS                 │  PROPERTIES + AI      │
│  (240px)     │   (@xyflow/react, flex-grow)       │  (300px)              │
│              │                                   │                       │
│ [Search...]  │    ┌─────────┐    ┌──────────┐   │  GBM — Paramètres     │
│              │    │  GBM    │───▶│  AutoML  │   │  ntrees: [50]         │
│ Supervised   │    │  Node   │    │  Node    │   │  learn_rate: [0.1]    │
│ ─ GBM        │    └─────────┘    └──────────┘   │                       │
│ ─ GLM        │                                   │  [Explain Pipeline ▶] │
│ ─ XGBoost    │    [EMPTY STATE: Drop here]       │                       │
│ ─ RF         │                                   │  AI: "GBM at step 2  │
│              │                                   │   compares trees..."  │
│ Unsupervised │                                   │  [👍] [👎]            │
│ ─ K-Means    │                                   │                       │
│ ─ PCA        │                                   │  🧠 Basé sur 3        │
│              │                                   │  sessions précédentes │
├──────────────┴───────────────────────────────────┴───────────────────────┤
│  PIPELINE TEMPLATES                              [🔍 Search] [+ Save Now] │
│  ──────────────────────────────────────────────────────────────────────── │
│  📦 ML Classic        📦 PageRank Simple     📦 Anomaly Chain             │
│  GBM→AutoML→Stack     Link→Weight→Rank       IsoForest→Thresh→Alert       │
│  3 nœuds · Supervised 4 nœuds · Search       2 nœuds · Anomaly           │
│  [Drag→Canvas]        [Drag→Canvas]           [Drag→Canvas]               │
│                                                                            │
│  📦 Recommandation    📦 NLP Sentiment        📦 Mon Pipeline (Custom)    │
│  KMeans→GLM→Matrix    Token→GLM→Class         [Vos nœuds actuels]         │
│  3 nœuds · RecSys     3 nœuds · NLP           Sauvegardé il y a 2h        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Hauteur du panneau bas :** 160px (2 rangées de cards) — collapsible via toggle à gauche de la barre titre.

#### Pourquoi le panneau bas est indispensable pour les algorithmes complexes

Pour un algorithme comme **Google PageRank** ou une **chaîne de traitement longue**, l'utilisateur ne peut pas reconstituer manuellement 8–12 nœuds à chaque session. La bibliothèque de templates résout :

1. **Algorithmes complexes** (15+ nœuds) → Drop d'un template = gain de 5 min
2. **Chaînes de commandes enchaînées** → Loops, gather, sort, merge préfabriqués
3. **Réutilisation** → Sauvegarder son pipeline du jour pour le réutiliser demain
4. **Apprentissage** → Les templates pré-définis montrent des exemples réels d'architectures

#### SubpipelineTemplate — Type et catalogue

```typescript
// services/subpipelineCatalog.ts

export interface SubpipelineNode {
  relativeId: string;                        // 'node_0', 'node_1', etc.
  algorithmId: string;                       // référence ALGORITHM_CATALOG
  relativePosition: { x: number; y: number }; // position relative au point de drop
  params?: Partial<AlgorithmParams>;          // paramètres custom si différents des défauts
}

export interface SubpipelineEdge {
  source: string;  // relativeId
  target: string;  // relativeId
}

export interface SubpipelineTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ml' | 'search' | 'recommendation' | 'anomaly' | 'nlp' | 'custom' | 'logic';
  nodeCount: number;
  tags: string[];                   // ['loop', 'classification', 'complex', 'google']
  nodes: SubpipelineNode[];
  edges: SubpipelineEdge[];
  createdAt?: number;               // timestamp si pipeline custom sauvegardé
  isUserCreated?: boolean;          // true = sauvegardé par l'utilisateur
}

// Catalogue Lot 1 — 5 templates pré-définis + 1 slot custom
export const SUBPIPELINE_CATALOG: SubpipelineTemplate[] = [
  {
    id: 'ml-classic',
    name: 'ML Classification Classic',
    description: 'GBM → AutoML → StackedEnsemble',
    category: 'ml',
    nodeCount: 3,
    tags: ['classification', 'supervised', 'ensemble'],
    nodes: [
      { relativeId: 'n0', algorithmId: 'gbm',    relativePosition: { x: 0,   y: 0   } },
      { relativeId: 'n1', algorithmId: 'automl', relativePosition: { x: 220, y: 0   } },
      { relativeId: 'n2', algorithmId: 'stacked', relativePosition: { x: 440, y: 0  } },
    ],
    edges: [
      { source: 'n0', target: 'n1' },
      { source: 'n1', target: 'n2' },
    ],
  },
  {
    id: 'pagerank-simple',
    name: 'Google PageRank Simplifié',
    description: 'Chargement liens → Analyse poids → Calcul rang → Tri',
    category: 'search',
    nodeCount: 4,
    tags: ['search', 'loop', 'google', 'complex', 'ranking'],
    nodes: [
      { relativeId: 'n0', algorithmId: 'glm',      relativePosition: { x: 0,   y: 0   } },
      { relativeId: 'n1', algorithmId: 'glrm',     relativePosition: { x: 220, y: 0   } },
      { relativeId: 'n2', algorithmId: 'rf',        relativePosition: { x: 440, y: 0   } },
      { relativeId: 'n3', algorithmId: 'automl',   relativePosition: { x: 660, y: 0   } },
    ],
    edges: [
      { source: 'n0', target: 'n1' },
      { source: 'n1', target: 'n2' },
      { source: 'n2', target: 'n3' },
    ],
  },
  {
    id: 'anomaly-chain',
    name: 'Anomaly Detection Chain',
    description: 'IsolationForest → Threshold → Alert',
    category: 'anomaly',
    nodeCount: 2,
    tags: ['anomaly', 'detection', 'unsupervised'],
    nodes: [
      { relativeId: 'n0', algorithmId: 'isoforest', relativePosition: { x: 0,   y: 0 } },
      { relativeId: 'n1', algorithmId: 'kmeans',    relativePosition: { x: 220, y: 0 } },
    ],
    edges: [{ source: 'n0', target: 'n1' }],
  },
  {
    id: 'recommendation-engine',
    name: 'Recommendation Engine',
    description: 'KMeans clustering → GLM scoring → Matrix output',
    category: 'recommendation',
    nodeCount: 3,
    tags: ['recommendation', 'collaborative-filtering', 'matrix'],
    nodes: [
      { relativeId: 'n0', algorithmId: 'kmeans', relativePosition: { x: 0,   y: 0 } },
      { relativeId: 'n1', algorithmId: 'glm',    relativePosition: { x: 220, y: 0 } },
      { relativeId: 'n2', algorithmId: 'pca',    relativePosition: { x: 440, y: 0 } },
    ],
    edges: [
      { source: 'n0', target: 'n1' },
      { source: 'n1', target: 'n2' },
    ],
  },
  {
    id: 'nlp-sentiment',
    name: 'NLP Sentiment Pipeline',
    description: 'GLM vectorization → Classification → Output',
    category: 'nlp',
    nodeCount: 3,
    tags: ['nlp', 'sentiment', 'text', 'classification'],
    nodes: [
      { relativeId: 'n0', algorithmId: 'glm',   relativePosition: { x: 0,   y: 0 } },
      { relativeId: 'n1', algorithmId: 'gbm',   relativePosition: { x: 220, y: 0 } },
      { relativeId: 'n2', algorithmId: 'rf',    relativePosition: { x: 440, y: 0 } },
    ],
    edges: [
      { source: 'n0', target: 'n1' },
      { source: 'n1', target: 'n2' },
    ],
  },
];
```

#### Expansion du prefab sur le canvas

Quand un `SubpipelineTemplate` est droppé sur le canvas, la logique d'expansion génère tous les nœuds et edges d'un coup :

```typescript
// Dans AlgorithmCanvas.tsx — onDrop étendu pour les prefabs
const onDrop = useCallback((event: DragEvent) => {
  event.preventDefault();
  const rawData = event.dataTransfer.getData('application/vad-node');
  if (!rawData) return;

  const payload: DragPayload = JSON.parse(rawData);
  const dropPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });

  if (payload.isPrefab && payload.prefabNodes && payload.prefabEdges) {
    // Expansion prefab : créer tous les nœuds avec offset depuis le drop point
    const idMap: Record<string, string> = {};
    const newNodes = payload.prefabNodes.map((pNode, idx) => {
      const uniqueId = `node_${Date.now()}_${idx}`;
      idMap[pNode.relativeId] = uniqueId;
      return {
        id: uniqueId,
        type: 'algorithmNode',
        position: {
          x: dropPosition.x + pNode.relativePosition.x,
          y: dropPosition.y + pNode.relativePosition.y,
        },
        data: {
          algorithmId: pNode.algorithmId,
          label: ALGORITHM_CATALOG.find(a => a.id === pNode.algorithmId)?.label ?? pNode.algorithmId,
          params: getDefaultParams(pNode.algorithmId),
        },
        className: `node-drop-in node-drop-delay-${idx}`,  // delay animé
      };
    });

    const newEdges = payload.prefabEdges.map((pEdge, idx) => ({
      id: `edge_${Date.now()}_${idx}`,
      source: idMap[pEdge.source],
      target: idMap[pEdge.target],
      animated: true,
    }));

    setNodes(nds => [...nds, ...newNodes]);
    setEdges(eds => [...eds, ...newEdges]);

  } else {
    // Nœud simple (logique existante)
    const newNode = {
      id: `node_${Date.now()}`,
      type: 'algorithmNode',
      position: dropPosition,
      data: { algorithmId: payload.algorithmId, label: payload.label,
              params: getDefaultParams(payload.algorithmId) },
      className: 'node-drop-in',
    };
    setNodes(nds => [...nds, newNode]);
  }
}, [screenToFlowPosition, setNodes, setEdges]);
```

#### Animation d'expansion prefab en cascade

```css
/* palette.css — section PREFAB EXPANSION */
@keyframes nodeDropDelay {
  0%   { transform: scale(0.4) translateY(-20px); opacity: 0; }
  70%  { transform: scale(1.05) translateY(0); opacity: 1; }
  100% { transform: scale(1.0); opacity: 1; }
}

/* Chaque nœud du prefab apparaît avec un délai croissant */
.node-drop-delay-0 { animation: nodeDropDelay 0.25s 0ms   cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.node-drop-delay-1 { animation: nodeDropDelay 0.25s 80ms  cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.node-drop-delay-2 { animation: nodeDropDelay 0.25s 160ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.node-drop-delay-3 { animation: nodeDropDelay 0.25s 240ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.node-drop-delay-4 { animation: nodeDropDelay 0.25s 320ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
```

#### Fonctionnalité "Save Current Pipeline as Template"

Le bouton `[+ Save Now]` dans la barre de titre du panneau bas :
1. Lit le state nodes + edges courant du canvas
2. Calcule les positions relatives (normalise à partir du nœud le plus à gauche)
3. Génère un `SubpipelineTemplate` avec `isUserCreated: true`
4. Le sauvegarde dans `localStorage` (tableau JSON `vad_user_templates`)
5. L'affiche comme dernière card dans le panneau bas

```typescript
// hooks/usePipelineSaver.ts
export function saveCurrentPipeline(
  nodes: Node[],
  edges: Edge[],
  name: string
): void {
  if (nodes.length === 0) return;

  // Normaliser les positions relatives
  const minX = Math.min(...nodes.map(n => n.position.x));
  const minY = Math.min(...nodes.map(n => n.position.y));

  const template: SubpipelineTemplate = {
    id: `custom_${Date.now()}`,
    name,
    description: `${nodes.map(n => n.data.algorithmId).join(' → ')}`,
    category: 'custom',
    nodeCount: nodes.length,
    tags: ['custom', 'user-created'],
    nodes: nodes.map((n, i) => ({
      relativeId: `n${i}`,
      algorithmId: n.data.algorithmId,
      relativePosition: {
        x: n.position.x - minX,
        y: n.position.y - minY,
      },
    })),
    edges: edges.map(e => ({
      source: `n${nodes.findIndex(n => n.id === e.source)}`,
      target: `n${nodes.findIndex(n => n.id === e.target)}`,
    })),
    createdAt: Date.now(),
    isUserCreated: true,
  };

  const stored = JSON.parse(localStorage.getItem('vad_user_templates') ?? '[]');
  stored.push(template);
  localStorage.setItem('vad_user_templates', JSON.stringify(stored));
}
```

#### SubpipelineLibraryPanel — Composant

```
ReaAaS-N-frontend/src/components/AlgorithmDesigner/
  SubpipelineLibraryPanel.tsx      (NOUVEAU — panneau bas)
    ├── SubpipelineCard.tsx        (NOUVEAU — card draggable individuelle)
    └── PipelineSaveDialog.tsx     (NOUVEAU — dialog pour nommer le template)
```

---

### C. RE-ANALYSE DES PHASES 7, 7-2, 7-3 — Identification des Lacunes

#### Ce qui a été couvert (résumé)

**Phase 7 :** Layout 3-colonnes harpoon-style · Catalogue H2O Lot 1 · DnD mentionné mais pas détaillé · palette.css · Arbre de composants F1-F13

**Phase 7-2 :** Inventaire interactions · Animations CSS · Export Excel · Tutoriel contextuel · IDE 3-panneaux react-resizable-panels · Raccourcis clavier · Script scraping RST · StatusBar · F14-F21

**Phase 7-3 :** Mémoire IA · Garde anti-boucle · 4 approches · SQLite+MiniSearch · Interface MemoryRepository · AIExplanationPanel mémoire · Mem0 Phase 2 · F22-F30

#### Lacunes identifiées — 20 points non couverts

| # | Lacune | Criticité | Phase proposée |
|---|--------|-----------|----------------|
| L1 | **DnD mechanics détaillées** — ghost image, DnDContext, CSS feedback | BLOQUANT | 7-4 ✅ ci-dessus |
| L2 | **Panneau bas SubpipelineLibrary** | HAUTE | 7-4 ✅ ci-dessus |
| L3 | **Validation de compatibilité des connexions** — quels nœuds peuvent se connecter ? | HAUTE | 7-4 ✅ ci-dessous |
| L4 | **State de pipeline incomplet** — avertissement visuel si pipeline invalide avant Explain | HAUTE | 7-4 ✅ ci-dessous |
| L5 | **Persistance pipeline** — localStorage schema exact pour save/restore | HAUTE | 7-4 ✅ ci-dessous |
| L6 | **Empty state design** — mentionné mais jamais spécifié en détail | MOYEN | 7-4 ✅ ci-dessous |
| L7 | **Context menu** — clic droit nœud / canvas / edge | MOYEN | 7-4 ✅ ci-dessous |
| L8 | **Routing et 404** — App.tsx routing complet jamais conçu | MOYEN | 7-4 ✅ ci-dessous |
| L9 | **Bannière offline** — backend unavailable state | MOYEN | 7-4 ✅ ci-dessous |
| L10 | **Multi-select** — sélectionner plusieurs nœuds pour bouger/supprimer en groupe | MOYEN | 7-4 ✅ ci-dessous |
| L11 | **Pipeline naming** — nommer/gérer plusieurs pipelines | FAIBLE | Phase 2 |
| L12 | **Undo/Redo** — déféré Phase 7 mais jamais planifié | FAIBLE | Phase 2 |
| L13 | **Responsive/Mobile** — canvas ne fonctionne pas bien < 768px | FAIBLE | Phase 2 |
| L14 | **Accessibilité clavier canvas** — navigation Tab dans le graph | FAIBLE | Phase 2 |
| L15 | **Virtualisation** — 50+ nœuds sur canvas | FAIBLE | Phase 3+ |
| L16 | **Copy/Paste nœuds** — Ctrl+C / Ctrl+V | FAIBLE | Phase 2 |
| L17 | **URL share** — pipeline encodé dans URL | FAIBLE | Phase 2 |
| L18 | **Node search rapide** — Ctrl+Space pour chercher sans retourner à palette | FAIBLE | Phase 2 |
| L19 | **Performance canvas** — @xyflow/react virtualization > 30 nœuds | FAIBLE | Phase 2+ |
| L20 | **DnD depuis canvas vers zone de suppression** — drag-to-trash | FAIBLE | Phase 2 |

#### 5 lacunes critiques traitées en Phase 7-4

Les lacunes L1-L10 sont couvertes dans les sections ci-dessous. L11-L20 sont déférées.

---

### D. LACUNES CRITIQUES — Solutions Phase 7-4

#### L3 — Validation de compatibilité des connexions

Règle Phase 1 : **tout algorithme peut se connecter à tout algorithme** (validation permissive). L'objectif éducatif prime sur la correction technique. L'IA explique le pipeline même si incohérent — c'est une occasion d'apprentissage.

Phase 2 : Ajouter une matrice de compatibilité (supervised → supervised valide, supervised → unsupervised = warning, etc.) affichée comme badge amber sur l'edge incompatible.

#### L4 — Indicateur de pipeline complet/invalide

```typescript
// hooks/usePipelineStatus.ts
export function usePipelineStatus(nodes: Node[], edges: Edge[]) {
  return useMemo(() => {
    if (nodes.length === 0) return 'empty';
    if (nodes.length === 1) return 'single-node';  // pas d'edge → pas de pipeline

    // Vérifier que chaque nœud a au moins 1 edge connecté
    const connectedIds = new Set([
      ...edges.map(e => e.source),
      ...edges.map(e => e.target),
    ]);
    const disconnectedCount = nodes.filter(n => !connectedIds.has(n.id)).length;

    if (disconnectedCount > 0) return 'disconnected';  // nœuds isolés
    return 'ready';   // pipeline complet — bouton Explain activé
  }, [nodes, edges]);
}

// Dans AlgorithmPropertiesPanel :
// status === 'ready'        → Bouton Explain vert, actif
// status === 'disconnected' → Bouton Explain grisé + tooltip "X nœuds non connectés"
// status === 'empty'        → Bouton Explain caché
// status === 'single-node'  → Bouton Explain grisé + tooltip "Ajoutez au moins 2 algorithmes"
```

#### L5 — Persistance localStorage (schema exact)

```typescript
// Clé localStorage : 'vad_pipeline'
// Format JSON :
interface StoredPipeline {
  version: 1;
  savedAt: number;                          // timestamp
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      algorithmId: string;
      label: string;
      params: Record<string, unknown>;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    animated: boolean;
  }>;
}

// Sauvegarde automatique via useEffect dans AlgorithmDesignerPage
useEffect(() => {
  if (nodes.length === 0) return;
  const toStore: StoredPipeline = { version: 1, savedAt: Date.now(), nodes, edges };
  localStorage.setItem('vad_pipeline', JSON.stringify(toStore));
}, [nodes, edges]);   // Autosave à chaque changement

// Restauration au mount
const loadSavedPipeline = (): Partial<StoredPipeline> | null => {
  try {
    const raw = localStorage.getItem('vad_pipeline');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPipeline;
    if (parsed.version !== 1) return null;  // migration future
    return parsed;
  } catch {
    return null;
  }
};
```

#### L6 — Empty State design complet

```
ÉTAT VIDE DU CANVAS (0 nœuds)
──────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    [Icône circuit pulsante]                     │
│                    @keyframes iconPulse (2s loop)               │
│                                                                 │
│          Construisez votre premier pipeline IA                  │
│    Glissez un algorithme depuis la gauche →  ici               │
│         ou choisissez un modèle en bas ↓                        │
│                                                                 │
│         [ Commencer avec ML Classic ▶ ]                         │
│         Bouton = drop automatique du prefab ml-classic          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Implémentation :
- Détecté via nodes.length === 0
- Rendu comme enfant de <ReactFlow> via <Panel position="center">
- Le bouton "Commencer avec ML Classic" appelle directement
  la logique d'expansion du prefab sans drag
```

#### L7 — Context Menu (clic droit)

```tsx
// Implémentation légère — aucune librairie supplémentaire
// useRef + onContextMenu + position absolue dans le DOM

const [contextMenu, setContextMenu] = useState<{
  type: 'node' | 'canvas' | 'edge';
  x: number; y: number;
  targetId?: string;
} | null>(null);

// Sur le canvas ReactFlow
onContextMenu={(e) => {
  e.preventDefault();
  setContextMenu({ type: 'canvas', x: e.clientX, y: e.clientY });
}}

// Sur chaque nœud custom
onContextMenu={(e) => {
  e.stopPropagation();
  e.preventDefault();
  setContextMenu({ type: 'node', x: e.clientX, y: e.clientY, targetId: id });
}}

// Menu nœud :   Supprimer | Dupliquer | Réinitialiser params
// Menu canvas : Coller (Phase 2) | Sélectionner tout | Nettoyer canvas
// Menu edge :   Supprimer connexion | Inverser sens
```

#### L8 — Routing App.tsx complet

```tsx
// App.tsx — routing complet Phase 1
<BrowserRouter>
  <Routes>
    <Route path="/"          element={<Navigate to="/designer" replace />} />
    <Route path="/designer"  element={<AlgorithmDesignerPage />} />
    <Route path="/builder"   element={<AlgorithmBuilderPage />} />
    <Route path="/circuit"   element={<CircuitDesignerPage />} />
    <Route path="*"          element={<NotFoundPage />} />  {/* 404 */}
  </Routes>
</BrowserRouter>

// NotFoundPage.tsx — minimal
// "Page non trouvée — Retour au Designer"
// Aucune infrastructure supplémentaire
```

#### L9 — Bannière Backend Offline

```tsx
// Dans App.tsx ou AlgorithmDesignerPage — polling health endpoint
const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

useEffect(() => {
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  };
  checkHealth();
  const interval = setInterval(checkHealth, 30_000);  // vérif toutes les 30s
  return () => clearInterval(interval);
}, []);

// Si backendOnline === false :
<Alert severity="warning" sx={{ borderRadius: 0 }}>
  Backend indisponible — l'explication IA n'est pas disponible. Vérifiez que le serveur tourne.
</Alert>
```

#### L10 — Multi-select

@xyflow/react v12 supporte le multi-select **natif** :
- `Shift + clic` = ajouter à la sélection
- `Ctrl + A` = sélectionner tous les nœuds
- Drag sur canvas vide = lasso de sélection
- Une fois sélectionnés : déplacer en groupe, `Delete` = supprimer tous

Aucun code nécessaire — activé par défaut dans @xyflow/react. Simplement documenter dans le tutoriel (ajouter step 6 dans TutorialOverlay).

---

### E. OUTILS DÉCOUVERTS PAR RECHERCHE — Référence comparative

| Outil | Stars | Type | Leçon applicable à VAD |
|-------|-------|------|------------------------|
| **@xyflow/react** | 27k | Canvas node-based React | NOTRE STACK — DnD, screenToFlowPosition, DnDContext confirmé |
| **Rete.js** | 12k | Visual programming framework | Concept "node groups" pour prefabs → adapté en SubpipelineTemplate |
| **React-Diagrams** | 9.4k | Diagrams (Blender/LabView/Unreal inspired) | "Designed for process" = confirmation de notre approche |
| **Node-RED** | Actif | Flow library, 5000+ pre-built flows | Bibliothèque community = inspiration Phase 2 partage templates |
| **FL Studio Channel Rack** | N/A | Audio DAW | Pattern "instrument rack" = notre panneau bas SubpipelineLibrary |
| **Neodrag** | 1.2k | Cross-platform DnD | Option Phase 1.5 pour support mobile |

**Décision :** aucun de ces outils n'est adopté dans le stack. @xyflow/react couvre tous les besoins canvas. Les patterns architecturaux sont empruntés sans dépendance.

---

### F. CHECKLIST EXHAUSTIVE — TOUT CE QUI DOIT ÊTRE PENSÉ POUR LE FRONTEND PHASE 7

> Cette checklist est le filet de sécurité final avant implémentation. Chaque ligne doit être cochée avant de déclarer la Phase 7 complète.

#### F.1 Architecture & Structure

- [x] Layout 3-colonnes (harpoon-style) avec panneau bas (7-4 ✅)
- [x] Arbre de composants complet
- [x] Hiérarchie ReactFlowProvider > DnDProvider > Composants
- [x] Routes App.tsx (/, /designer, /builder, /circuit, 404)
- [x] palette.css comme source unique de vérité couleur
- [x] TypeScript strict — interfaces pour tous les types de données

#### F.2 États UI (SKILL boundary)

- [x] Empty state canvas (aucun nœud) — design complet (7-4 ✅)
- [x] Loading state — shimmer pendant explainPipeline
- [x] Error state — API erreur + backend offline banner (7-4 ✅)
- [x] Success state — texte AI affiché avec fadeIn
- [x] Disconnected pipeline state — bouton Explain grisé (7-4 ✅)
- [x] Dragging state — palette card opacity + canvas glow

#### F.3 Données & Catalogue

- [x] ALGORITHM_CATALOG — 6 algos H2O Lot 1
- [x] SUBPIPELINE_CATALOG — 5 templates prefab Lot 1 (7-4 ✅)
- [x] SubpipelineTemplate type + interface (7-4 ✅)
- [x] getDefaultParams() — valeurs H2O par défaut
- [x] Pipeline persistence (localStorage schema exact) (7-4 ✅)
- [x] User templates persistence (localStorage 'vad_user_templates') (7-4 ✅)

#### F.4 Drag and Drop

- [x] DnDContext — dragType + dragPayload + setDrag + clearDrag (7-4 ✅)
- [x] Palette card onDragStart — dataTransfer.setData (7-4 ✅)
- [x] Canvas onDragOver — preventDefault (7-4 ✅)
- [x] Canvas onDrop — screenToFlowPosition + setNodes (7-4 ✅)
- [x] Canvas onDrop pour prefabs — expansion multi-nœuds (7-4 ✅)
- [x] Ghost image CSS — palette card opacity + canvas glow (7-4 ✅)
- [x] Animation cascade prefab drop — node-drop-delay-N (7-4 ✅)
- [x] ReactFlowProvider wrappant tout le module Designer

#### F.5 Canvas & Nœuds

- [x] AlgorithmNode.tsx — custom node avec handles H2O
- [x] AlgorithmCanvas.tsx — ReactFlow wrapper
- [x] Connexions edges — animated: true + CSS strokeDashoffset
- [x] usePipelineStatus hook — empty/single/disconnected/ready (7-4 ✅)
- [x] Context menu — node/canvas/edge (7-4 ✅)
- [x] Multi-select — natif @xyflow/react, documenter dans tutoriel (7-4 ✅)
- [x] Delete nœud — touche Delete, nœud sélectionné
- [x] Autosave localStorage — useEffect sur nodes/edges (7-4 ✅)
- [x] Restore au mount — loadSavedPipeline() (7-4 ✅)

#### F.6 Panneau Bas (SubpipelineLibrary)

- [x] SubpipelineLibraryPanel.tsx — composant panneau bas collapsible (7-4 ✅)
- [x] SubpipelineCard.tsx — card draggable individuelle (7-4 ✅)
- [x] PipelineSaveDialog.tsx — dialog nommer et sauvegarder (7-4 ✅)
- [x] SUBPIPELINE_CATALOG Lot 1 — 5 templates (7-4 ✅)
- [x] "Save Now" → usePipelineSaver hook → localStorage (7-4 ✅)
- [x] Affichage templates custom sauvegardés en fin de liste

#### F.7 Propriétés & AI

- [x] AlgorithmPropertiesPanel.tsx — H2OParamField par param
- [x] H2OParamField — integer/float/boolean/enum
- [x] AIExplanationPanel.tsx — loading/error/success + MemoryBadge + FeedbackButtons
- [x] Bouton Explain activé/grisé selon pipelineStatus (7-4 ✅)
- [x] Excel export (SheetJS workbookExporter)

#### F.8 Mémoire & Backend

- [x] MemoryRepository interface (Phase 7-3)
- [x] SQLiteMemoryRepository (Phase 7-3)
- [x] AIPipelineService avec loopback guard MAX_ITER=5 (Phase 7-3)
- [x] POST /api/ai/explain-pipeline endpoint
- [x] POST /api/memory/feedback endpoint
- [x] GET /api/health endpoint (Phase 0 B12)
- [x] Backend health polling 30s dans frontend (7-4 ✅)
- [x] X-Session-Id header dans chaque appel API

#### F.9 Animations & CSS

- [x] nodeDropIn keyframe (Phase 7-2)
- [x] nodeDropDelay-N cascade keyframes (7-4 ✅)
- [x] handlePulse keyframe (Phase 7-2)
- [x] textFadeIn keyframe (Phase 7-2)
- [x] edgeDrawIn / animated edge (Phase 7-2)
- [x] iconPulse keyframe pour empty state (7-4 ✅)
- [x] prefers-reduced-motion media query (Phase 7-2)

#### F.10 UX & Accessibilité

- [x] Tutoriel contextuel 6 steps (Phase 7-2)
- [x] Raccourcis clavier useKeyboardShortcuts (Phase 7-2)
- [x] StatusBar (Phase 7-2)
- [x] WCAG AA — contraste vérifié dans palette.css
- [x] Multi-select documenté dans tutoriel (7-4 ✅)
- [x] Tooltip sur Explain button grisé (7-4 ✅)

#### F.11 Sécurité

- [x] CORS origines explicites backend (Phase 0 B9)
- [x] express-rate-limit sur POST /api/ai/explain (Phase 0 B11)
- [x] Erreur middleware global Express (Phase 0 B10)
- [x] Pas de hex raw dans composants — palette.css only
- [x] JSON.parse localStorage dans try/catch (7-4 ✅)

#### F.12 Déféré Phase 2+ (ne pas implémenter en Phase 1)

- [ ] Undo/Redo (trop complexe pour MVP)
- [ ] Pipeline naming multi-pipelines
- [ ] Responsive/Mobile
- [ ] Copy/Paste nœuds
- [ ] URL shareable pipeline
- [ ] Node search rapide Ctrl+Space
- [ ] Drag-to-trash zone
- [ ] Accessibilité clavier canvas (Tab navigation dans graph)
- [ ] Virtualisation 50+ nœuds

---

### G. NOUVELLES TÂCHES Phase 7-4

- [ ] F31. Créer `contexts/DnDContext.tsx` — DnDProvider + useDnD avec DragPayload typé
- [ ] F32. Mettre à jour `AlgorithmPalette.tsx` — onDragStart avec dataTransfer.setData + CSS dragging state
- [ ] F33. Mettre à jour `AlgorithmCanvas.tsx` — onDrop étendu pour single node + prefab expansion
- [ ] F34. Créer `services/subpipelineCatalog.ts` — 5 templates Lot 1 + types SubpipelineTemplate
- [ ] F35. Créer `components/AlgorithmDesigner/SubpipelineLibraryPanel.tsx` — panneau bas collapsible
- [ ] F36. Créer `components/AlgorithmDesigner/SubpipelineCard.tsx` — card draggable prefab
- [ ] F37. Créer `components/AlgorithmDesigner/PipelineSaveDialog.tsx` — dialog nommer + sauvegarder
- [ ] F38. Créer `hooks/usePipelineStatus.ts` — hook retourne 'empty'|'single-node'|'disconnected'|'ready'
- [ ] F39. Créer `hooks/usePipelineSaver.ts` — saveCurrentPipeline() + loadSavedPipeline()
- [ ] F40. Mettre à jour `AlgorithmDesignerPage.tsx` — intégrer SubpipelineLibraryPanel + health check
- [ ] F41. Créer `components/AlgorithmDesigner/CanvasEmptyState.tsx` — état vide avec bouton "Commencer"
- [ ] F42. Créer `components/AlgorithmDesigner/CanvasContextMenu.tsx` — clic droit node/canvas/edge
- [ ] F43. Mettre à jour `App.tsx` — routing complet + NotFoundPage + health banner
- [ ] F44. Ajouter CSS cascade prefab dans `palette.css` — nodeDropDelay-0 à nodeDropDelay-4 + iconPulse
- [ ] F45. Ajouter step 6 "Multi-select" dans `TutorialOverlay.tsx`

---

### H. RÉCAPITULATIF STACK CONFIRMÉ — Phase 7-4

| Couche | Technologie | Rôle Phase 7-4 |
|--------|-------------|----------------|
| DnD | HTML Drag and Drop API natif | Cross-panel drag, ghost image |
| DnD Context | React Context (custom) | Partage du payload drag entre panels |
| Prefab Library | TypeScript statique | 5 templates pré-définis + custom user |
| Prefab Persistence | localStorage | Templates user sauvegardés |
| Pipeline Persistence | localStorage | Autosave nodes + edges |
| Context Menu | React state + CSS absolue | 0 librairie supplémentaire |
| Pipeline Status | React useMemo hook | Valide le pipeline avant Explain |
| Empty State | ReactFlow `<Panel>` | Intégré dans canvas @xyflow |
| Health Check | fetch polling 30s | Bannière offline automatique |
| Mobile DnD | Phase 1.5 Neodrag | Déféré, option documentée |

**Aucune nouvelle dépendance npm ajoutée en Phase 7-4** — toutes les fonctionnalités sont construites avec ce qui est déjà en stack.

---

### Stack — Validations Phase 7-4 (26 avril 2026)

| Validation | Source | Résultat |
|------------|--------|---------|
| @xyflow/react DnD — `screenToFlowPosition` + `onDrop` + `DnDContext` pattern | reactflow.dev/examples/interaction/drag-and-drop (26 avril 2026) | ✅ Confirmé, 3 approches documentées : HTML DnD API, Pointer Events, Neodrag |
| Rete.js node groups concept | github.com/retejs/rete (12k stars, MIT) | ✅ Confirme faisabilité des node groups = base SubpipelineTemplate |
| Node-RED Flow Library (5000+ flows) | nodered.org | ✅ Valide le concept bibliothèque de pipelines partageables (Phase 2) |
| FL Studio Channel Rack pattern | image-line.com (26 avril 2026) | ✅ Pattern "instruments → rack → mix" = notre palette → panneau bas → canvas |
| HTML Drag and Drop API mobile : non supporté | MDN, reactflow.dev docs | ✅ Confirmé — Neodrag comme solution Phase 1.5 |

**Décisions nouvelles IRRÉVERSIBLES Phase 7-4 :**
- `DnDContext` = unique canal de communication entre panneau gauche, panneau bas et canvas — jamais de props drilling entre panneaux
- Panneau bas = `SubpipelineLibraryPanel` est une 4e zone distincte de l'IDE (collapsible, hauteur fixe 160px)
- Templates prefab = **catalogue statique TypeScript** Lot 1 — pas d'API runtime, pas de base de données Phase 1
- User templates = **localStorage uniquement** Phase 1 — aucune sync serveur
- Pipeline autosave = déclenché sur chaque changement `nodes`/`edges` — pas de bouton "Sauvegarder" manuel Phase 1
- Validation pipeline = **permissive Phase 1** (tout nœud peut se connecter à tout nœud) — éducatif > strict
- Mobile DnD = **hors scope Phase 1** — accepté et documenté
