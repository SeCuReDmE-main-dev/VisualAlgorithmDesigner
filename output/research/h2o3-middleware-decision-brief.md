# Objective

Evaluate whether H2O-3 should become the middleware layer for Visual Algorithm Designer, especially after adding Supabase, and whether it can close the remaining coding phase by enabling AI-token portability and MOJO export.

# Environment / Stack Context

VAD is currently a React 18 + Vite + TypeScript frontend with an Express backend. The backend exposes `/api/ai/explain-pipeline` and `/api/ai/evaluate-pipeline`, using Groq directly through `groq-sdk`. Local memory is SQLite + MiniSearch. Supabase has been added as a schema/migration layer for algorithms, H2O params, projects, and node templates, but the application is not yet deeply wired to Supabase clients or Edge Functions.

The repo already contains a strong H2O knowledge layer: H2O theory files, a 143-parameter H2O manifest, H2O parameter JSON files, and UI/plan references to H2O AutoML, GBM, Random Forest, XGBoost, Deep Learning, GLM, Stacked Ensemble, parameter export, and workbench mode.

# Research Questions

1. Should H2O-3 be used as the main middleware layer?
2. Can H2O-3 solve multi-provider LLM token routing?
3. Does MOJO meaningfully improve VAD's product direction?
4. What is the smallest useful integration path given the current code?

# Findings

## H2O-3 as ML Engine

H2O-3 fits VAD's algorithmic workbench direction. Official H2O docs describe H2O-3 as a REST-accessible ML platform with AutoML, model builders, leaderboards, frame/model APIs, and production model export. H2O AutoML trains and ranks multiple models and supports constraints such as `include_algos`, `exclude_algos`, `max_models`, and `max_runtime_secs`.

Evidence: confirmed by primary sources.

## MOJO / POJO Export

MOJO/POJO is a real product advantage for VAD because it turns a visual algorithm pipeline into something deployable. Official H2O docs say generated models are embeddable in Java environments and use `h2o-genmodel.jar` as the scoring dependency. This maps well to VAD's promise: design visually, validate, then export a production artifact.

Evidence: confirmed by primary sources.

## H2O-3 Is Not an LLM Token Gateway

H2O-3 itself is not the right abstraction for "connect any AI token". It is a classical ML/AutoML runtime, not a universal LLM gateway. H2O's enterprise GenAI stack/h2oGPTe has an architecture that includes an OpenAI-compatible server and LiteLLM proxy for multi-provider routing, but that is not the same as embedding simple H2O-3 in the frontend.

Evidence: confirmed by primary sources.

## Current Code Wants a Backend Adapter, Not Frontend H2O

The current frontend calls only the Express backend for AI actions. The secure place for API keys is already the backend. Supabase docs also reinforce that secret keys belong only in backend components or secured functions, never in browser code. Therefore, H2O-3 should not be integrated "au frontend" except as UI metadata and status display. Any runtime H2O integration should be behind Express or a separate worker.

Evidence: confirmed by repo inspection and primary sources.

## Best Split of Responsibilities

Supabase should own durable app data: users, projects, algorithms, H2O params, node templates, run metadata, model artifacts metadata.

Express should remain the orchestration API: auth checks, pipeline validation, LLM calls, job creation, rate limits, audit.

H2O-3 should be optional worker/runtime: train AutoML/model jobs, produce leaderboard/metrics, export MOJO, expose job status.

A separate LLM gateway should handle provider/token routing if VAD needs "any AI provider". LiteLLM or OpenRouter are closer to that problem than H2O-3. OpenRouter is hosted and simple; LiteLLM is self-hostable and powerful but creates a critical secrets boundary.

Evidence: confirmed by repo inspection and primary sources; provider choice requires a separate security/cost decision.

# Recommended Path

Do not make H2O-3 the central middleware for everything.

Use H2O-3 as a Phase 2 ML execution adapter behind the backend:

`frontend canvas -> Express /api/ml/jobs -> H2O-3 worker/cluster -> metrics + MOJO artifact -> Supabase metadata`

For the multi-provider AI-token problem, create a separate `llmProviderService` abstraction first:

`AIPipelineService -> LLM provider adapter -> Groq now, OpenRouter/LiteLLM later`

This keeps the current working loop intact while opening the door to H2O execution and provider portability.

# Alternatives Considered

## H2O-3 Everywhere

Rejected for now. It would mix classical ML execution, LLM routing, API gateway, storage, and frontend concerns. That would increase deployment complexity and would not solve provider tokens cleanly.

## H2O-3 Only as Static Documentation

Too conservative. The repo already has enough H2O metadata; the next valuable step is a small live H2O proof of execution.

## LiteLLM/OpenRouter First

Reasonable if the biggest pain is Groq lock-in and latency. It does not improve the algorithmic/ML artifact side as much as H2O, but it directly solves provider routing.

# Risks / Unknowns

- H2O-3 adds Java runtime and memory requirements.
- AutoML jobs can be long-running, so the backend needs async jobs, status polling, cancellation, and artifact cleanup.
- MOJO is strongest for supported H2O models; not every arbitrary visual pipeline maps cleanly to one MOJO.
- If user-supplied datasets are added, privacy, storage limits, and deletion policies become first-class requirements.
- Any LLM gateway holding user/provider keys becomes a high-risk trust boundary.

# Sources

- H2O-3 REST API reference: https://docs.h2o.ai/h2o/latest-stable/h2o-docs/rest-api-reference.html
- H2O AutoML documentation: https://docs.h2o.ai/h2o/latest-stable/h2o-docs/automl.html
- H2O productionizing / MOJO / POJO documentation: https://docs.h2o.ai/h2o/latest-stable/h2o-docs/productionizing.html
- Enterprise h2oGPTe architecture: https://docs.h2o.ai/enterprise-h2ogpte/architecture/architecture-overview
- Enterprise h2oGPTe models documentation: https://docs.h2oai.com/enterprise-h2ogpte/guide/models-section
- LiteLLM documentation: https://docs.litellm.ai/
- OpenRouter provider routing documentation: https://openrouter.ai/docs/features/provider-routing/
- Supabase API keys documentation: https://supabase.com/docs/guides/getting-started/api-keys
