# Registre des Gates VAD

| Gate | Build/commit | Preuves requises | Matériel | Verdict | Gate suivante autorisée |
|---|---|---|---|---|---|
| −1 | HEAD `cfcbc6f`, worktree préservé | audit réconcilié, inventaires, routage, flags default-off | aucun | Complète après validation des flags | Gate 0 uniquement |
| 0 | à recalculer après réparations | unitaires, lint, build, 9 projets Playwright, 900 drops, budgets, captures | touch réel + stylet réel | Réouverte | Non |
| 1 | non commencé | contrats et moteur commun | aucun | Gelée | Non |
| 2 | code partiel préservé | annex adapters et intégrations | aucun | Gelée | Non |
| 3 | code partiel préservé | Terraform plan-only | aucun | Gelée | Non |
| 4 | code partiel préservé | preuves déterministes 93 | aucun | Gelée | Non |
| 5 | code partiel préservé | UX/comptes/disclaimers | appareils responsive | Gelée | Non |
| 6 | non commencé | matrice intégrée, sécurité, hashes | navigateurs publics | Gelée | Non |

Chaque mise à jour doit enregistrer date, commandes exactes, versions, hash du diff, rapports et justification du verdict. Une preuve provenant d'un ancien build ne ferme jamais une Gate.
