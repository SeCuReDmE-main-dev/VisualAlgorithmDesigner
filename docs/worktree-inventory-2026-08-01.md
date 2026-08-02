# Inventaire protégé des worktrees — 2026-08-01

## Visual Algorithm Designer

- HEAD: `cfcbc6fd41c0b8c22a14a8328e883c5bc99a0e9a`
- hash du diff suivi au début de la reprise: `7c26c475380ceea4523825416da2f7bfbaad91b5`
- état: worktree sale; aucune réinitialisation, suppression destructive ou restauration autorisée.
- changements Gate 0 identifiés: canvas canonique, DnDContext/machine, drag source, historique de graphe, ports typés, transaction prefab, Playwright et styles du workbench.
- changements post-Gate 0 à préserver mais geler: H2O catalog, RaySight/backend, score/promotion, AlgoQuest bridge, Supabase et `infra/codeproject-ai`.
- changements d'origine utilisateur ou incertaine à préserver: README, fichiers racine, configuration Vite/ESLint, `REVIEW.md`, répertoire `node_modules.a1-incomplete`, anciens fichiers supprimés et toute entrée non suivie.

Commande de réconciliation obligatoire avant toute future suppression:

```powershell
git status --short
git diff --name-status
git ls-files --others --exclude-standard
```

## Algorithm Builder

- HEAD: `38642574f9b82a7151b3dfb7ec623c0d89b6fa4f`
- hash du diff suivi: `e69de29bb2d1d6434b8b29ae775ad8c2e48c5391`
- état observé: propre.
- politique: lecture seule jusqu'à la fermeture complète de Gate 0.
