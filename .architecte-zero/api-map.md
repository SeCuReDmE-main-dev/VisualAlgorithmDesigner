# API map

Toutes les routes sont servies par `RaySight-backend/server.js`.

| Méthode | Route | Rôle | Gate 0 |
|---|---|---|---|
| GET | `/api/hello` | diagnostic | non utilisée |
| GET | `/api/health` | santé backend | masquée |
| GET | `/api/catalog/h2o-parameters` | catalogue H2O | masquée |
| POST | `/api/ai/explain-pipeline` | explication RaySight | masquée |
| POST | `/api/ai/explain` | explication compatible | masquée |
| POST | `/api/ai/evaluate-pipeline` | évaluation | masquée |
| POST | `/api/memory/feedback` | retour utilisateur | masquée |
| POST | `/api/ml/jobs` | création job ML | masquée |
| GET | `/api/ml/jobs/:id` | état job | masquée |
| POST | `/api/ml/jobs/:id/cancel` | annulation | masquée |
| GET | `/api/ml/jobs/:id/artifacts` | artefacts | masquée |

Les routes protégées utilisent session, rate limiting et CORS à origines exactes. Le modèle d'autorisation complet demeure une inconnue de Gate 2.
