# Visual Algorithm Designer (VAD)

> **Development status.** This school tool is currently tagged **pre-alpha / in development**. External PRs are not evaluated for merge until the maintained tool reaches a stable, fully functional 100% classroom release after the pre-alpha phase. Issues and forks remain allowed, but official PR review is paused until that stability gate is met.


> **Design, evaluate, and validate AI pipelines visually — from educational playground to professional compliance workbench.**

> **Official school governance.** VAD is for training students and teachers to understand, design, and review algorithms. It is not a tool for theft, fraud, bypass, abuse, or criminal automation. The maintained classroom route supports Codex/OpenAI or Antigravity/Gemini only. See [SCHOOL_TOOL_GOVERNANCE.md](SCHOOL_TOOL_GOVERNANCE.md) and [AGENTS.md](AGENTS.md).

> **License.** This project uses the Secured Educational License 2.0 (`LicenseRef-SEL-2.0`). See [LICENSE](LICENSE), [NOTICE](NOTICE), and [DISCLAIMER](DISCLAIMER).

[![Issues](https://img.shields.io/github/issues/SeCuReDmE-main-dev/VisualAlgorithmDesigner)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/issues)
[![Milestones](https://img.shields.io/badge/milestones-M0--M7-blue)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/milestones)
[![Project Board](https://img.shields.io/badge/project-kanban-purple)](https://github.com/users/SeCuReDmE-main-dev/projects/3)
[![Branch](https://img.shields.io/badge/branch-PaQBoT-green)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/tree/PaQBoT)

---

## What is VAD?

Visual Algorithm Designer is a full-stack web application that lets you **build algorithm pipelines by dragging and dropping nodes on a canvas**, then **evaluate their coherence using AI** (Groq / llama-3.1-8b-instant), and optionally **generate compliance reports** aligned with privacy regulations (Loi 25 / ÉFVP).

The application targets two user profiles on a single spectrum:

| Mode | User | Goal |
|------|------|------|
| **Playground** | Students, makers, game designers | Understand algorithmic logic with friendly vocabulary and visual feedback |
| **Workbench** | Data scientists, ML engineers, compliance officers | Design production-grade H2O.ai pipelines with security profiles and audit reports |

---

## Core Features

- **Drag-and-drop canvas** powered by [@xyflow/react](https://reactflow.dev/) — build pipelines by connecting algorithm nodes (GBM, Random Forest, XGBoost, Deep Learning, GLM, Stacked Ensemble)
- **AI explanation** — select any node and get a plain-language explanation of what it does and why it fits your pipeline, streamed from Groq
- **Pipeline evaluation** — submit your full pipeline for a `coherenceScore` (0–100); pipelines scoring ≥ 93 can be promoted to the validated catalog
- **Subpipeline library** — 5 pre-built templates (ML Classique, NLP Stack, Anomaly Detection, Time Series, Compliance Pipeline) draggable as prefab node groups
- **Validated algorithm catalog** — locally persisted list of your promoted pipelines with loop detection (DFS) and version tracking
- **Security profiles** — 7 profiles (Standard, Red Team, Privacy-First, Regulatory, Minimal, Research, Adversarial) that adjust AI prompt behavior and pipeline validation thresholds
- **Compliance report generator** — produces ÉFVP-lite reports with SHA-256 hash for auditable pipeline documentation
- **Excel export** — download H2O.ai parameter sheets (2-tab `.xlsx`) for any algorithm node via SheetJS
- **Persistent memory** — AI conversations indexed with BM25 (MiniSearch + SQLite) for context-aware follow-up explanations
- **Keyboard shortcuts** — `Ctrl+B` toggle palette · `Ctrl+J` toggle AI panel · `Ctrl+S` save pipeline

---

## Architecture

```
VisualAlgorithmDesigner/
├── ReaAaS-N-frontend/          # React 18 + TypeScript + Vite
│   └── src/
│       ├── components/
│       │   └── AlgorithmDesigner/   # Canvas, Palette, Panels, Nodes
│       ├── contexts/               # DnDContext (drag payload)
│       ├── hooks/                  # usePipelineEvaluation, useLoopDetector, ...
│       ├── pages/                  # AlgorithmDesignerPage (3-column layout)
│       ├── services/               # api.ts, algorithmCatalog, subpipelineCatalog
│       └── styles/                 # palette.css (design tokens)
│
├── ReaAaS-N-backend/           # Express 5 + Groq SDK
│   ├── server.js               # Routes: /api/ai/*, /api/memory/*, /api/health
│   ├── services/
│   │   ├── aiPipelineService.ts     # Groq prompts, loopback guard, security profiles
│   │   └── sqliteMemoryRepository.ts # SQLite + MiniSearch BM25 memory
│   └── data/                   # SQLite database (gitignored)
│
└── docs/
    └── plan.md                 # Source of truth — all architecture decisions (Phases 1-10)
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React + TypeScript | 18.2.0 + 5.0.2 |
| Build tool | Vite | 6.3.5 |
| Canvas / graph | @xyflow/react | 12.10.2 |
| UI components | MUI | ^6.0.0 |
| Drag and drop | @hello-pangea/dnd | 18.0.1 |
| Routing | react-router-dom | 7.6.1 |
| Backend | Express | 5.2.0 |
| AI provider | Groq SDK | 1.1.2 |
| AI model | llama-3.1-8b-instant | — |
| Memory store | better-sqlite3 + MiniSearch | — |
| Rate limiting | express-rate-limit | — |
| Excel export | SheetJS (xlsx) | — |

---

## Prerequisites

- **Node.js** ≥ 20 (LTS)
- **npm** ≥ 10
- **Groq API key** — free at https://console.groq.com/keys

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner.git
cd VisualAlgorithmDesigner
git checkout PaQBoT
```

### 2. Configure the backend environment

```bash
cp ReaAaS-N-backend/.env.example ReaAaS-N-backend/.env
```

Open `ReaAaS-N-backend/.env` and set your Groq API key:

```env
GROQ_API_KEY=gsk_your_key_here
```

All other values have safe defaults for local development.

### 3. Install dependencies

```bash
# Backend
cd ReaAaS-N-backend && npm install

# Frontend
cd ../ReaAaS-N-frontend && npm install
```

### 4. Start development servers

Open two terminals:

```bash
# Terminal 1 — Backend (port 3001)
cd ReaAaS-N-backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd ReaAaS-N-frontend && npm run dev
```

Open http://localhost:5173 in your browser.

### 5. Verify the API

```bash
curl http://localhost:3001/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

---

## Development Roadmap

Implementation is tracked through **8 milestones** and **63 GitHub issues** on the [project board](https://github.com/users/SeCuReDmE-main-dev/projects/3).

| Milestone | Focus | Issues | Status |
|-----------|-------|--------|--------|
| **M0** — Infrastructure | Fix all blockers, dev server runs clean | #12-#21, #115, #116 | ✅ Complete |
| **M1** — Backend Core | SQLite memory, AI pipeline service, feedback endpoint | #22-#28 | ✅ Complete |
| **M2** — Frontend Foundation | palette.css tokens, routing, services, DnD context | #29-#37 | ✅ Complete |
| **M3** — Core Canvas Loop | Drag node → canvas → AI explanation (E2E) | #38-#45 | ✅ Complete |
| **M4** — Subpipeline Library | 5 prefab templates, 4-tab panel, drag-to-expand | #46-#51 | ✅ Complete |
| **M5** — Evaluation & Promotion | coherenceScore, ≥93% promotion, loop detection | #52-#59 | ✅ Complete |
| **M6** — UX Polish | Excel export, keyboard shortcuts, tutorial, animations | #60-#66 | ✅ Complete |
| **M7** — Security & Compliance | 7 security profiles, ÉFVP report, audit hash | #67-#72 | ✅ Complete |

Each issue contains a single testable acceptance criterion. Closing an issue with a commit message containing `Closes #NNN` automatically advances the milestone progress bar.

---

## Contributing

> **Phase 10 (M0-M7) is implemented.** The codebase is fully functional. See the Phase 10 completion audit in [docs/plan.md](docs/plan.md) for full details.

1. Browse open issues — Phase 11 issues (browser QA, deployment, Phase 2 features) will appear in new milestones
2. Read the issue body for the exact file target and acceptance criterion
3. Implement the minimal patch — read the target file before editing
4. Commit with `Closes #NNN` in the message body
5. The issue closes automatically and the milestone graph updates

All architectural decisions are documented in [docs/plan.md](docs/plan.md). Do not introduce new dependencies or change the stack without updating that file first.

---

## Project Links

| Resource | URL |
|----------|-----|
| Issues | https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/issues |
| Milestones | https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/milestones |
| Project board | https://github.com/users/SeCuReDmE-main-dev/projects/3 |
| Architecture plan | [docs/plan.md](docs/plan.md) |

---

## License

MIT


