# Objective

Repair and improve drag-and-drop into the Algorithm Designer middle canvas, using Harpoon-like workflow-builder qualities where they are publicly observable: direct manipulation, visible lift, clear drop zones, and reliable placement.

# Environment / Stack Context

- confirmed by primary sources: the frontend uses React 18, MUI 6, `@xyflow/react` 12, and has `@hello-pangea/dnd` installed.
- confirmed by local repo truth: the Algorithm Designer canvas is implemented with React Flow in `ReaAaS-N-frontend/src/components/AlgorithmDesigner/AlgorithmCanvas.tsx`.
- confirmed by local repo truth: palette and template cards previously used native HTML `draggable` events and a simple context payload.

# Research Questions

- Why does drag/drop feel broken in the middle panel?
- What makes modern workflow drag/drop feel polished?
- What should be changed in this repo without replacing React Flow or copying private code?

# Findings

- confirmed by local repo truth: the drop target was the canvas wrapper, while actual interaction happens inside React Flow. Native HTML drag events can be brittle inside pointer-heavy canvases.
- tentative due to missing evidence: Harpoon's proprietary source or drag engine is not publicly available from the searched material, so it cannot be copied or verified directly.
- inferred from multiple secondary sources: strong drag/drop UX needs immediate draggable affordance, a lifted preview, a visibly active landing area, and feedback at the drop moment.
- confirmed by local repo truth: React Flow already provides `screenToFlowPosition`, so exact placement should remain owned by the canvas rather than guessed by palette cards.

# Recommended Path

Use a pointer-driven drag layer in the existing `DnDContext`:

- palette/template cards start a global pointer drag
- the drag preview follows the cursor
- the canvas highlights when the pointer is inside it
- pointer release inside the canvas creates the node or prefab using `screenToFlowPosition`
- native HTML drag/drop remains as fallback

# Alternatives Considered

- Replace the canvas drag/drop with `@hello-pangea/dnd`: rejected because that library is best for ordered lists and boards, not freeform React Flow placement.
- Add another drag/drop framework: rejected for now because the existing stack already has React Flow coordinate conversion and only needed reliable drag state.
- Keep only native HTML drag/drop: rejected because it is the likely source of the fragile middle-panel behavior.

# Risks / Unknowns

- Touch users may still need dedicated long-press or larger handles later.
- Automated browser drag testing is still thin; unit coverage now verifies the new pointer drag state, while full canvas drag should be covered by E2E when the suite exists.
- The production bundle still warns that one chunk is larger than 500 kB; this predates the drag/drop fix and was not addressed here.

# Sources

- Local repository: `ReaAaS-N-frontend/package.json`
- Local repository: `ReaAaS-N-frontend/src/components/AlgorithmDesigner/AlgorithmCanvas.tsx`
- Local repository: `ReaAaS-N-frontend/src/components/AlgorithmDesigner/AlgorithmPalette.tsx`
- Local repository: `ReaAaS-N-frontend/src/components/AlgorithmDesigner/SubpipelineCard.tsx`
- UX Studio, "The 7 Commandments Of Designing Drag And Drop Interfaces": https://www.uxstudioteam.com/ux-blog/drag-and-drop-interface
- Eleken, "Drag and drop UI examples and UX tips": https://www.eleken.co/blog-posts/drag-and-drop-ui
- Codrops, "Drag and Drop Interaction Ideas": https://tympanus.net/codrops/2014/11/11/drag-and-drop-interaction-ideas/
