# DESIGN.md — Visual Algorithm Designer (VAD)

> Generated from FfeD research + palette extraction. Agent-friendly design system tokens.

---

## Core Design Philosophy

**Spatial Computing Interface** — Not a page to scroll, but a space to explore. No DOM grid, no flexbox/grid as primary layout. Radial topology: central hub + orbital satellites connected by force-directed curves.

---

## Color Palette

### Warm Accents (Left Hemisphere — Action/Input)
| Token | Value | Usage |
|-------|-------|-------|
| `--amber-primary` | `#FFB74D` | Primary actions, algorithm nodes |
| `--amber-light` | `#FFE0B2` | Hover states, highlights |
| `--amber-dark` | `#F57C00` | Active states, borders |
| `--orange-warm` | `#FF8A65` | Input connectors, data sources |

### Cool Accents (Right Hemisphere — Output/Result)
| Token | Value | Usage |
|-------|-------|-------|
| `--blue-primary` | `#4FC3F7` | Data sources, inputs |
| `--blue-light` | `#B3E5FC` | Background accents |
| `--blue-dark` | `#0288D1` | Validated states, success |
| `--teal-output` | `#26C6DA` | Outputs, visualizations |

### Neutral / Glass
| Token | Value | Usage |
|-------|-------|-------|
| `--space-bg` | `#0D1117` | Deep space background |
| `--panel-bg` | `rgba(22, 27, 34, 0.85)` | Glass panels |
| `--border-glass` | `rgba(255, 255, 255, 0.08)` | Subtle borders |
| `--text-primary` | `#E6EDF3` | Primary text |
| `--text-secondary` | `#8B949E` | Secondary text |

### Status Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#3FB950` | Validated, approved |
| `--warning` | `#D29922` | Needs review |
| `--error` | `#F85149` | Failed, rejected |
| `--info` | `#58A6FF` | Information, links |

---

## Typography

| Scale | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `xs` | 0.75rem | 1rem | Code, labels |
| `sm` | 0.875rem | 1.25rem | Secondary text, parameters |
| `base` | 1rem | 1.5rem | Body, descriptions |
| `lg` | 1.25rem | 1.75rem | Subtitles, panel headers |
| `xl` | 1.5rem | 2rem | Section titles |
| `2xl` | 2rem | 2.5rem | Algorithm name in center node |
| `3xl` | 3rem | 1 | Hero / landing |

**Font Stack**: `'Inter', system-ui, -apple-system, sans-serif`
**Mono**: `'JetBrains Mono', 'Fira Code', monospace`

---

## Spacing

| Scale | Value | Usage |
|-------|-------|-------|
| `0` | 0px | — |
| `1` | 4px | Tight inline |
| `2` | 8px | Compact gaps |
| `3` | 12px | Internal padding |
| `4` | 16px | Standard padding |
| `5` | 24px | Section gaps |
| `6` | 32px | Large gaps |
| `8` | 48px | Page sections |
| `10` | 64px | Hero spacing |

---

## Effects

### Glassmorphism
```css
.glass-panel {
  background: rgba(22, 27, 34, 0.85);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}
```

### Glow / Pulse
```css
.node-glow {
  box-shadow: 0 0 20px rgba(255, 183, 77, 0.3),
              0 0 60px rgba(255, 183, 77, 0.1);
  transition: box-shadow 0.3s ease;
}

.node-glow:hover {
  box-shadow: 0 0 30px rgba(255, 183, 77, 0.5),
              0 0 80px rgba(255, 183, 77, 0.2);
}

.edge-pulse {
  animation: pulse-flow 2s ease-in-out infinite;
}

@keyframes pulse-flow {
  0%, 100% { opacity: 0.4; stroke-dashoffset: 0; }
  50% { opacity: 1; stroke-dashoffset: -20; }
}
```

---

## Component Tokens

### Algorithm Node
- Radial glow on hover
- 48-72px diameter (scales with importance)
- Color depends on category (amber=process, blue=input, teal=output, green=validated)
- Glass border with subtle shadow

### Edge / Connection
- SVG Bézier curves between nodes
- Stroke: `rgba(255, 255, 255, 0.12)` idle, `--amber-primary` active
- Stroke width: 1.5px idle, 2.5px active
- Animated dash pattern on data flow

### Panels (Properties, Catalog, AI Chat)
- Glass background with backdrop-blur
- Subtle border glow on focus
- Collapsible with smooth 300ms transitions

### Canvas
- Infinite pannable/zoomable background
- Subtle radial gradient from center (warm → cool edges)
- Grid dots (not lines) for spatial reference at zoomed-out levels
- Cursor: grab (idle), grabbing (panning), crosshair (connecting)

---

## Interactions & Animations

| Interaction | Duration | Easing |
|------------|----------|--------|
| Node hover glow | 300ms | ease-out |
| Panel open/close | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Node spawn/delete | 400ms | cubic-bezier(0.34, 1.56, 0.64, 1) (spring) |
| Edge draw | 500ms | ease-in-out |
| Zoom/pan | real-time | linear |
| Status pulse | 2s loop | ease-in-out |
| Data flow animation | 1.5s loop | linear |

---

## Accessibility

- All nodes focusable via Tab with visible focus rings
- ARIA roles: `role="application"` on canvas, `role="tree"` on palette
- Keyboard shortcuts: Space=select, Delete=remove, Ctrl+D=duplicate, Ctrl+Z=undo
- Color-blind safe: shape + label, not just color

---

## Implementation Stack

```
React 19 + TypeScript
├── Canvas: D3-Force + SVG overlay for connections
├── Panels: Tailwind CSS + glass tokens
├── 3D (optional): Three.js / R3F for hero view
├── State: Zustand (lightweight, no Redux overhead)
├── Drag-Drop: @dnd-kit (accessible, customizable)
└── Animations: Framer Motion
```

---

*Generated by Saphir 💎 from FfeD research + Jules conversations. Agent-friendly, ready for Stitch/Jules consumption.*
