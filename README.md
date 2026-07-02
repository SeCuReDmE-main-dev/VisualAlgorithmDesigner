# Visual Algorithm Designer (VAD)

[![SecuredMe Education Suite public calendar](https://img.shields.io/badge/SecuredMe%20Education%20Suite-public%20calendar%20%7C%20alpha%20Aug%203%202026-5484ED?style=for-the-badge&logo=googlecalendar&logoColor=white)](https://calendrier.securedme.ca)

**Attribution:** Jean-Sebastien Beaulieu · [ORCID 0009-0007-2904-0443](https://orcid.org/0009-0007-2904-0443) · [SecuredMe](https://securedme.ca) · [Visual Algorithm Designer](https://vad.securedme.ca)

<!-- SECUREDME-SUITE-BADGES:START -->
[![Issues](https://img.shields.io/github/issues/SeCuReDmE-main-dev/VisualAlgorithmDesigner?color=161B6A)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/issues)
[![Milestones](https://img.shields.io/badge/milestones-M0--M7-23B8FF)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/milestones)
[![Project Board](https://img.shields.io/badge/project-kanban-6F42FF)](https://github.com/users/SeCuReDmE-main-dev/projects/3)
[![Branch](https://img.shields.io/badge/branch-PaQBoT-0E7490)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/tree/PaQBoT)
<!-- SECUREDME-SUITE-BADGES:END -->

<!-- SECUREDME-STARTUP-SUPPORT:START -->
<p align="center">
  <a href="https://e2b.dev/startups">
    <img alt="Gateway-ready E2B audit lane" src="https://img.shields.io/badge/Gateway--ready-E2B%20audit%20lane-FF8800?style=for-the-badge" />
  </a>
  <a href="https://www.datadoghq.com/partner/datadog-for-startups/">
    <img alt="Gateway-ready Datadog observability" src="https://img.shields.io/badge/Gateway--ready-Datadog%20observability-632CA6?style=for-the-badge&amp;logo=datadog&amp;logoColor=white" />
  </a>
</p>

> **Gateway support acknowledgement.** This SecuredMe school tool is gateway-compatible. E2B audit support and Datadog observability are routed through the shared SecuredMe gateway when that lane is configured; this repository does not claim a direct E2B or Datadog runtime dependency by default, and no E2B or Datadog secret is stored in this README.
<!-- SECUREDME-STARTUP-SUPPORT:END -->




## School Authentication And Secret Boundary
This repository is a small SecuredMe school tool. Official classroom use must not require `.env` files, API keys, raw tokens, or local model secrets. Student and teacher workflows must use Codex/OpenAI or Antigravity/Gemini through browser WebAuth, fingerprinted session approval, and encrypted local session records when authentication is needed.

The reason for excluding generic local AI routes from official school mode is student and teacher safety: education accounts, provider-side account controls, browser login, and governed AI refusal behavior are safer than unguided local model endpoints for classroom cybersecurity and algorithm-building tools.

> **Development status.** This school tool is currently tagged **pre-alpha / in development**. External PRs are not evaluated for merge until the maintained tool reaches a stable, fully functional 100% classroom release after the pre-alpha phase. Issues and forks remain allowed, but official PR review is paused until that stability gate is met.

> **SecuredMe Education visual theme.** This pre-alpha school tool uses the shared SecuredMe Education open-source visual identity. See [assets/securedme/education](assets/securedme/education) for light/dark logo and thin banner assets.


> **Design, inspect, and learn algorithm pipelines visually — from classroom playground to supervised review workbench.**

> **Official school governance.** VAD is for training students and teachers to understand, design, and review algorithms. It is not a tool for theft, fraud, bypass, abuse, or criminal automation. The maintained classroom route supports Codex/OpenAI or Antigravity/Gemini only. See [SCHOOL_TOOL_GOVERNANCE.md](SCHOOL_TOOL_GOVERNANCE.md) and [AGENTS.md](AGENTS.md).

> **License.** This project uses the Secured Educational License 2.0 (SEL-2.0). It is provided for education, research, simulation, classroom training, and supervised learning. Misuse, unsafe private forks, unsupported provider routes, and unsupervised authority claims are not maintained or endorsed by the official school version. See [LICENSE](LICENSE), [NOTICE](NOTICE), [DISCLAIMER](DISCLAIMER), and [SAFETY.md](SAFETY.md).

[![Issues](https://img.shields.io/github/issues/SeCuReDmE-main-dev/VisualAlgorithmDesigner)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/issues)
[![Milestones](https://img.shields.io/badge/milestones-M0--M7-blue)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/milestones)
[![Project Board](https://img.shields.io/badge/project-kanban-purple)](https://github.com/users/SeCuReDmE-main-dev/projects/3)
[![Branch](https://img.shields.io/badge/branch-PaQBoT-green)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/tree/PaQBoT)

---

## What is VAD?

Visual Algorithm Designer is a school-focused web application that lets students and teachers **build algorithm pipelines by dragging and dropping nodes on a canvas**, inspect their structure, and prepare review notes through the maintained school routes: Codex/OpenAI or Antigravity/Gemini. The in-app backend does not require a classroom API key; when no approved external school assistant is attached, it falls back to deterministic local guidance.

The application targets two supervised learning profiles on a single spectrum:

| Mode | User | Goal |
|------|------|------|
| **Playground** | Students, makers, game designers | Understand algorithmic logic with friendly vocabulary and visual feedback |
| **Review Workbench** | Teachers, mentors, advanced learners | Review pipeline structure, traceability, and safety boundaries before classroom reuse |

---

## Core Features

- **Drag-and-drop canvas** powered by [@xyflow/react](https://reactflow.dev/) — build pipelines by connecting algorithm nodes and learning concepts visually
- **School guidance panel** — select any node and get plain-language guidance from the local fallback or from an approved external school assistant workflow
- **Pipeline evaluation** — submit your full pipeline for a `coherenceScore` (0–100); pipelines scoring ≥ 93 can be promoted to the validated catalog
- **Subpipeline library** — 5 pre-built templates (ML Classique, NLP Stack, Anomaly Detection, Time Series, Compliance Pipeline) draggable as prefab node groups
- **Validated algorithm catalog** — locally persisted list of your promoted pipelines with loop detection (DFS) and version tracking
- **Safety profiles** — 7 profiles that adjust review thresholds, warnings, and classroom boundaries
- **Review report generator** — produces structured review notes with SHA-256 hash for auditable classroom documentation; it is not legal, regulatory, or compliance certification
- **Excel export** — download algorithm parameter sheets (2-tab `.xlsx`) for selected algorithm nodes via SheetJS
- **Persistent memory** — local review conversations indexed with BM25 (MiniSearch + SQLite) for context-aware follow-up explanations
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
├── ReaAaS-N-backend/           # Express 5 + local school runtime hooks
│   ├── server.js               # Routes: /api/ai/*, /api/memory/*, /api/health
│   ├── services/
│   │   ├── aiPipelineService.js     # school runtime hook, fallback guidance, loopback guard, safety profiles
│   │   └── sqliteMemoryRepository.ts # SQLite + MiniSearch BM25 memory
│   └── data/                   # SQLite database (gitignored)
│
└── docs/
    └── plan.md                 # Historical planning archive; current school-provider policy is in this README and SCHOOL_TOOL_GOVERNANCE.md
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
| School AI route | Codex/OpenAI or Antigravity/Gemini external workflow | browser WebAuth |
| In-app fallback | deterministic school guidance runtime | local |
| Memory store | better-sqlite3 + MiniSearch | — |
| Rate limiting | express-rate-limit | — |
| Excel export | SheetJS (xlsx) | — |

---

## Prerequisites

- **Node.js** ≥ 20 (LTS)
- **npm** ≥ 10
- No classroom API key is required for the maintained local fallback path.

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner.git
cd VisualAlgorithmDesigner
git checkout PaQBoT
```

### 2. Configure the backend environment

No `.env` file is required for the default classroom fallback path. Keep official AI-assisted classroom work in Codex/OpenAI or Antigravity/Gemini browser-authenticated sessions; do not add local model secrets or unsupported provider keys to the maintained school route.

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
| **M7** — Safety & Review Reporting | 7 safety profiles, review report, audit hash | #67-#72 | ✅ Complete |

Each issue contains a single testable acceptance criterion. Closing an issue with a commit message containing `Closes #NNN` automatically advances the milestone progress bar.

---

## Contributing

> **Current status.** This repository is pre-alpha / in development. Older planning notes remain available in [docs/plan.md](docs/plan.md), but the current school-provider policy is Codex/OpenAI or Antigravity/Gemini only.

1. Browse open issues — Phase 11 issues (browser QA, deployment, Phase 2 features) will appear in new milestones
2. Read the issue body for the exact file target and acceptance criterion
3. Implement the minimal patch — read the target file before editing
4. Commit with `Closes #NNN` in the message body
5. The issue closes automatically and the milestone graph updates

Do not introduce new dependencies or change the stack without updating this README, [SCHOOL_TOOL_GOVERNANCE.md](SCHOOL_TOOL_GOVERNANCE.md), and the relevant implementation docs. Historical planning notes in [docs/plan.md](docs/plan.md) may contain superseded provider experiments and are not the current school-provider contract.

---

## Project Links

| Resource | URL |
|----------|-----|
| Issues | https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/issues |
| Milestones | https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/milestones |
| Project board | https://github.com/users/SeCuReDmE-main-dev/projects/3 |
| Historical planning archive | [docs/plan.md](docs/plan.md) |

---

## License

MIT







