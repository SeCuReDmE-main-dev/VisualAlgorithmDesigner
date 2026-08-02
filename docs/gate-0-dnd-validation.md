# Gate 0 — preuve drag-and-drop et connexions

Statut: **automatisation verte, validation matérielle en attente**.

Ce document porte uniquement sur les actions 1 à 27. Il n'autorise pas le
démarrage des annexes, de Terraform, de la validation 93 %, de RaySight ou du
déploiement.

## Contrat vérifié

- machine d'état `idle -> armed -> dragging -> committing -> idle/cancelled`;
- pointeur primaire, capture du pointeur et seuil d'activation de 6 px;
- annulation par Escape, perte de capture, `pointercancel`, blur et visibilité;
- ghost déplacé par `requestAnimationFrame` et transform DOM;
- grille 20 px, placement exact après conversion écran/flow et exclusion des overlays;
- placement souris, touch synthétique, stylet synthétique, clavier et bouton central;
- validation typée des ports, cardinalités, doublons, auto-connexions et cycles;
- insertion atomique des prefabs avec un seul Undo et un seul Redo.

## Matrice navigateur

Les scénarios fonctionnels ont passé sur Chromium, Firefox et WebKit, chacun
aux viewports desktop, tablette et téléphone. La transaction prefab a aussi été
vérifiée sur les neuf projets.

Le stress test exécute 100 drops par projet. Chaque cycle exige un retour à
`idle` et un nombre de nœuds exactement égal à l'itération courante.

| Projet | 100 drops | Durée du scénario |
|---|---:|---:|
| Chromium desktop | 100/100 | 2,6 min |
| Chromium tablette | 100/100 | 2,2 min |
| Chromium téléphone | 100/100 | 2,1 min |
| Firefox desktop | 100/100 | 4,2 min |
| Firefox tablette | 100/100 | 3,8 min |
| Firefox téléphone | 100/100 | 2,8 min |
| WebKit desktop | 100/100 | 5,4 min |
| WebKit tablette | 100/100 | 2,9 min |
| WebKit téléphone | 100/100 | 2,5 min |

Total: **900 insertions exactes, zéro double insertion**.

## Budgets Gate 0

| Budget | Limite | Résultat |
|---|---:|---:|
| Coalescence du mouvement | au plus un dispatch MOVE par frame | validé par test unitaire |
| Poignée tactile | au moins 44 x 44 px | 44 x 44 px |
| Stress par projet | moins de 7 min | maximum 5,4 min |
| Bundle JS principal compressé | moins de 300 kB gzip | 291,02 kB gzip |
| Double insertion | 0 sur 900 | 0 |

## Suites reproductibles

- frontend: 136 tests sur 136;
- backend: 23 tests sur 23;
- tests ciblés Gate 0: 66 tests sur 66;
- lint frontend: zéro erreur et zéro avertissement;
- build Vite de production: réussi;
- matrice Playwright fonctionnelle: 81 scénarios sur 81 avant le scénario
  prefab, puis prefab validé sur les neuf projets.

Le typage global conserve une dette préexistante dans le module distinct
`CircuitDesigner` et quelques anciens fixtures. Les fichiers Gate 0 modifiés ne
produisent plus d'erreur TypeScript.

La validation du 2 août 2026 a été exécutée depuis le chemin physique
`C:\Dev folder\SecuredMe Education suite\VisualAlgorithmDesigner` parce que
Vitest résout incorrectement le lecteur réseau `Z:`. La configuration Vite
conserve désormais les liens symboliques; aucun fichier n'a été copié pour ce
contrôle.

## Blocage de fermeture

La Gate 0 ne peut pas être déclarée fermée tant que les deux contrôles suivants
n'ont pas été exécutés sur du matériel physique:

1. une tablette ou un téléphone tactile réel;
2. un appareil avec stylet réel.

Les événements touch et pen synthétiques sont verts, mais ils ne remplacent pas
une preuve matérielle. Après ces deux contrôles, le résultat, l'appareil, le
navigateur et la date doivent être ajoutés ici avant d'ouvrir la Gate 1.
