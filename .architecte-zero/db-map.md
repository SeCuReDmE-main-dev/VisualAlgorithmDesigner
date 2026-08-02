# Database map

## SQLite backend

- `memories`: mémoire de session.
- `feedback`: évaluations de réponses.
- `ml_jobs`: cycle de vie des jobs ML.
- `ml_job_artifacts`: artefacts associés aux jobs.
- `sessions`: stockage `express-session` via connect-sqlite3.

## Supabase gelé

- `algorithms`, `h2o_params`, `algorithm_categories`, `projects`, `node_templates`.
- `ml_jobs`, `ml_job_artifacts`.

Les contraintes RLS et la convergence SQLite/Supabase restent à valider en Gate 2.
