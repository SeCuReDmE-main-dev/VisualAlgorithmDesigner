# Visual Algorithm Designer

![Visual Algorithm Designer — SecuredMe Education](docs/assets/repository/readme-banner-2026.png)

[![License SEL-2.0](https://img.shields.io/badge/license-SEL--2.0-6F42FF)](LICENSE)
[![Pre-alpha](https://img.shields.io/badge/status-pre--alpha-0E7490)](AGENTS.md)
[![Issues](https://img.shields.io/github/issues/SeCuReDmE-main-dev/VisualAlgorithmDesigner)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/issues)
[![Main history](https://img.shields.io/github/last-commit/SeCuReDmE-main-dev/VisualAlgorithmDesigner/main)](https://github.com/SeCuReDmE-main-dev/VisualAlgorithmDesigner/commits/main/)
[![SPONSORED BY E2B FOR STARTUPS](https://img.shields.io/badge/SPONSORED%20BY-E2B%20FOR%20STARTUPS-ff3001?style=for-the-badge&labelColor=black)](https://e2b.dev/startups)

Build and inspect a visible algorithm graph, with typed ports, history and reviewed specialist exports.

[Public surface](https://visual-algorithm.securedme.ca/) · [Tool documentation](https://securedme-main-dev.github.io/securedme-scholarium/en/tools/visual-algorithm-designer/) · [Education hub](https://securedme.ca/product/education/)

**Status:** pre-alpha, active public development. Public pages and a successful local test do not establish a deployed school service. E2B sponsorship recognition is separate from runtime availability and included quota.

## How it works

The React Flow designer owns graph editing. Its WebMCP runtime reads the displayed graph, stages proposals, checks session and revision again after human review, and exports the actual graph locally.

## Local development

Record the checkout and existing changes before editing:

```powershell
git status --short --branch
git rev-parse HEAD
```

In a clean development checkout, use the committed lockfile or package manifest. The commands below are setup instructions, not a claim that every dependency or optional service has been verified:

```powershell
Set-Location RaySight-frontend
npm ci
npm run dev
```

Run the relevant local checks from the repository root; the indicated `Set-Location` is needed only when starting from that root:

```powershell
Set-Location RaySight-frontend
npx --no-install tsc --noEmit
npm test
npm run build
```

## Source map

- [RaySight-frontend/src/components/AlgorithmDesigner](RaySight-frontend/src/components/AlgorithmDesigner)
- [RaySight-frontend/src/components/VadWebMcpBridge.tsx](RaySight-frontend/src/components/VadWebMcpBridge.tsx)
- [RaySight-frontend/src/services/webMcpTools.ts](RaySight-frontend/src/services/webMcpTools.ts)
- [RaySight-backend](RaySight-backend)

## Practice exercise

Add one sorting block through a reviewed proposal. Inspect the graph, undo the action, then export a synthetic graph and compare its nodes with the visible canvas.

During an individual course, learners choose suite tools to practice. The eight-week final project is the learner's own tool, submitted by the learner to an eligible hackathon after checking its age, AI, originality and licensing rules.

## Boundaries and privacy

Native WebMCP and a reviewed export were verified locally with a synthetic Gateway session. Live authorization and other specialist routes are not yet verified. Exports remain pending AlgoQuest review and do not alter progression.

The official school routes are Codex/OpenAI and Antigravity/Gemini with human review. Never distribute raw tokens, learner data, prompts or private correspondence. No hidden learner analytics are added. Public analytics require explicit consent; general autocapture and session replay remain disabled. Optional local technical telemetry is separate from learner records and product audit history.

See [AGENTS.md](AGENTS.md) and [SCHOOL_TOOL_GOVERNANCE.md](SCHOOL_TOOL_GOVERNANCE.md) for current authority and provider boundaries. Maintainer-authorized maintenance follows repository protections and required reviews. General contribution restrictions remain governed by [CONTRIBUTING.md](CONTRIBUTING.md).

## License, authorship and history

The repository's actual license is [SEL-2.0](LICENSE). Keep the license, attribution, notices and safety boundaries when reusing the code.

Jean-Sebastien Beaulieu · [ORCID 0009-0007-2904-0443](https://orcid.org/0009-0007-2904-0443) · [SecuredMe](https://securedme.ca/)

[README source before curation](docs/archive/README-before-curation-2026-09-30.txt) retains the exact previous text, implementation journals and attribution. It is historical: its old telemetry commands, readiness claims and contribution dates are not current operating instructions. [Presentation history](docs/repository-presentation-history-2026-09-30.md) retains previous badges. [GitHub social image](docs/assets/repository/github-social-preview-2026.jpg) accompanies this README.
