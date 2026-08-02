# Component map

- `AlgorithmDesignerPage`: shell workbench, historique, sélection et panneaux.
- `AlgorithmPalette` / `SubpipelineLibraryPanel`: sources de blocs et prefabs Gate 0.
- `H2OParameterPalette`: annexe préservée mais non montée par défaut.
- `AlgorithmCanvas`: transaction d'ajout, validation de connexion et intégration DnD.
- `SpatialCanvas`: unique wrapper React Flow canonique.
- `AlgorithmNode` / `AlgorithmEdge`: rendu et ports typés.
- `AlgorithmPropertiesPanel`: paramètres locaux; actions d'annexe masquées en Gate 0.
- `AIExplanationPanel`: RaySight préservé mais non monté par défaut.
- `StatusBar`: compteurs de graphe et état de boucle.
- `PipelineSaveDialog`, `CanvasContextMenu`, `TutorialOverlay`: interactions locales.
