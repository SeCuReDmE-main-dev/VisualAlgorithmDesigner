# Objective

Clarify how H2O-3 can help Visual Algorithm Designer users turn approved visual algorithms into trainable/executable artifacts, memories, templates, or deployable code, and whether this closes the backend/codebase enough to move toward deeper frontend design.

# Environment / Stack Context

Current VAD already has:

- React canvas for visual algorithm composition.
- Express backend with Groq-powered explanation/evaluation.
- SQLite memory repository with BM25 search.
- Supabase schema for algorithms, H2O parameters, projects, and node templates.
- H2O parameter/theory datasets already in the repo.

The missing backend layer is not "AI intelligence" in general. The missing layer is a concrete execution/artifact loop:

`approved canvas -> job -> metrics -> artifact -> reusable memory/template`

# Research Questions

1. Does H2O-3 train Groq or other LLMs?
2. What does H2O-3 actually add to VAD?
3. How should async AutoML jobs be modeled?
4. What limits does MOJO have?
5. What must be true before user datasets/provider keys are accepted?
6. Does H2O-3 accelerate the build, or add premature complexity?

# Findings

## H2O-3 Does Not Train Groq Directly

H2O-3 is a classical ML / AutoML / predictive analytics platform. It can train H2O models and export MOJO/POJO artifacts. Groq is primarily an LLM inference provider, with fine-tuning/LoRA support only for exact supported model versions and access conditions. Therefore, H2O-3 should not be described as "training Groq".

Correct framing:

- H2O trains a predictive model from structured data.
- Supabase stores project data, approved pipeline metadata, model/job metadata, and memories.
- Groq or another LLM reads those memories/artifacts as context through prompt/RAG/tool calls.
- Optional future fine-tuning can use generated datasets, but only through a provider that supports the target base model.

Evidence: confirmed by primary sources.

## H2O-3 Adds a Real Execution Layer

H2O-3's REST API exposes H2O capabilities over JSON/HTTP. H2O-3 supports supervised and unsupervised algorithms such as GBM, K-Means, PCA, Stacked Ensemble, XGBoost, and AutoML. This maps strongly to VAD's current H2O-oriented catalog.

Evidence: confirmed by primary sources and repo inspection.

## Runtime Cost Is Real but Manageable for a Local/Single-User MVP

H2O-3 requires Java. H2O recommends allocating about four times the memory of the data to the H2O node. If memory is not configured, JVM defaults often allocate around 25% of physical memory. H2O AutoML with XGBoost needs extra memory outside the Java heap, so H2O should use no more than about two thirds of RAM when XGBoost is enabled.

Evidence: confirmed by primary sources.

## AutoML Requires Job Infrastructure

AutoML is not a synchronous button action. Even small runs can take long enough that VAD needs jobs, status polling, cancellation, quotas, and artifact cleanup. The current `/api/ai/explain-pipeline` and `/api/ai/evaluate-pipeline` are synchronous AI endpoints; H2O execution should be separate.

Evidence: confirmed by primary sources and repo architecture.

## MOJO Is Valuable but Not Universal

MOJO is strongest for supported H2O model families. MOJOs are thread safe, and XGBoost MOJOs require an extra `h2o-genmodel-ext-xgboost` dependency. A user-created arbitrary visual algorithm is not automatically a MOJO. VAD needs a compiler/mapper that says:

- this canvas maps to H2O AutoML/model builder;
- this canvas maps to documentation/memory only;
- this canvas maps to code template only;
- this canvas is invalid or unsupported.

Evidence: confirmed by primary sources.

## Dataset and Key Security Cannot Be Deferred Forever

H2O's own security assumptions are data-center oriented. H2O is not designed to withstand denial-of-service attacks, and its security model assumes secure deployment boundaries. Supabase docs are explicit that secret keys belong only in backend components and should never be exposed in browser code. Therefore, VAD must not let the frontend talk directly to H2O or hold provider secrets.

Evidence: confirmed by primary sources.

# Recommended Path

Use H2O-3 to create a "training/execution lab" only after the backend has a narrow job loop.

Phase A: Keep Groq as default free evaluator.

- Add provider abstraction later, but do not block the current product on it.
- Add hard caps/rate limits to preserve the free tier.
- Treat Groq as evaluator/instructor, not as the thing H2O trains.

Phase B: Add H2O metadata compiler.

- Convert an approved canvas into an `ExecutionPlan`.
- Validate whether the canvas is H2O-compatible.
- Store the plan in Supabase.

Phase C: Add tiny H2O job MVP.

- One endpoint creates a job.
- One endpoint polls status.
- One endpoint cancels/cleans job.
- Start with one dataset fixture and one small AutoML/GBM run.
- Store leaderboard + metrics + artifact metadata.

Phase D: Add memory/artifact layer.

- Turn approved algorithm into:
  - structured memory record;
  - prompt/tool context;
  - reusable node template;
  - optional H2O MOJO if supported;
  - optional code-generation template.

# The Product Mechanism

The strong product idea is not "train any AI model".

The strong product idea is:

`A user builds an algorithm visually. VAD validates it. If it passes threshold, VAD turns it into a reusable algorithm asset: memory, template, metrics, and when possible a deployable H2O MOJO.`

That is specific, buildable, and defensible.

# Alternatives Considered

## No H2O-3

VAD can still be valid as an educational and compliance algorithm designer. It can use Groq + Supabase + static H2O docs. This is enough for frontend polish and demos, but it lacks the "trained/exportable artifact" step.

## H2O-3 Immediately

Useful only if scoped tightly. If added as a broad runtime for all algorithms, it will slow the build. If added as one narrow job path, it can close the backend loop.

## LLM Gateway First

This solves provider lock-in, but does not solve algorithm execution or MOJO export. It is not the same problem as H2O.

# Risks / Unknowns

- H2O cluster lifecycle on Windows/dev and production hosting.
- Java availability and memory caps.
- Long-running job cancellation reliability.
- Mapping visual pipelines to H2O-supported model builders.
- Dataset privacy, retention, and deletion.
- Provider-key custody if BYOK is added.
- Whether users need real model execution now, or whether explain/evaluate/export is enough for first frontend push.

# Sources

- H2O-3 welcome / REST / requirements: https://docs.h2o.ai/h2o/latest-stable/h2o-docs/welcome.html
- H2O-3 starting / JVM memory: https://docs.h2o.ai/h2o/latest-stable/h2o-docs/starting-h2o.html
- H2O AutoML memory requirements: https://docs.h2o.ai/h2o/latest-stable/h2o-docs/automl.html
- H2O MOJO quickstart: https://docs.h2o.ai/h2o/latest-stable/h2o-docs/mojo-quickstart.html
- H2O security model: https://docs.h2o.ai/h2o/latest-stable/h2o-docs/security.html
- Groq supported models / API docs: https://console.groq.com/docs/models
- Groq LoRA docs: https://console.groq.com/docs/lora
- Supabase API keys: https://supabase.com/docs/guides/getting-started/api-keys
