import { useMemo, useState } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  body: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'palette', title: 'Pick an algorithm', body: 'Start from the palette and choose the model family that matches the dataset.' },
  { id: 'canvas', title: 'Build the flow', body: 'Drop algorithms on the canvas and connect data, model, prediction, and metric ports.' },
  { id: 'params', title: 'Tune parameters', body: 'Select a node to review the H2O parameters before running an explanation.' },
  { id: 'explain', title: 'Ask for explanation', body: 'Use the AI panel to explain the selected node or the full pipeline.' },
  { id: 'save', title: 'Save your work', body: 'Save reusable pipelines locally so you can continue later.' },
  { id: 'evaluate', title: 'Evaluate coherence', body: 'Run a pipeline evaluation and inspect weak points before promotion.' },
  { id: 'promote', title: 'Promote validated work', body: 'Pipelines scoring 93% or higher can be promoted to the validated catalog.' },
];

export interface TutorialOverlayProps {
  open: boolean;
  steps?: TutorialStep[];
  onClose: () => void;
}

export function TutorialOverlay({ open, steps = TUTORIAL_STEPS, onClose }: TutorialOverlayProps) {
  const [index, setIndex] = useState(0);
  const safeSteps = useMemo(() => (steps.length > 0 ? steps : TUTORIAL_STEPS), [steps]);
  const step = safeSteps[Math.min(index, safeSteps.length - 1)];

  if (!open) {
    return null;
  }

  const isFirst = index === 0;
  const isLast = index === safeSteps.length - 1;

  return (
    <div role="presentation" style={backdropStyle}>
      <section aria-labelledby="tutorial-title" style={panelStyle}>
        <div style={progressStyle}>
          {safeSteps.map((item, stepIndex) => (
            <span key={item.id} aria-current={stepIndex === index ? 'step' : undefined} style={stepIndex === index ? activeDotStyle : dotStyle} />
          ))}
        </div>

        <p style={eyebrowStyle}>
          {index + 1} / {safeSteps.length}
        </p>
        <h2 id="tutorial-title" style={titleStyle}>
          {step.title}
        </h2>
        <p style={bodyStyle}>{step.body}</p>

        <footer style={actionsStyle}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Skip
          </button>
          <div style={navStyle}>
            <button type="button" disabled={isFirst} onClick={() => setIndex((current) => Math.max(0, current - 1))} style={isFirst ? disabledButtonStyle : secondaryButtonStyle}>
              Back
            </button>
            <button type="button" onClick={isLast ? onClose : () => setIndex((current) => Math.min(safeSteps.length - 1, current + 1))} style={primaryButtonStyle}>
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 60,
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(15, 23, 42, 0.58)',
};

const panelStyle: React.CSSProperties = {
  width: 'min(520px, calc(100vw - 32px))',
  display: 'grid',
  gap: 12,
  padding: 22,
  borderRadius: 8,
  background: '#ffffff',
  color: '#172033',
  boxShadow: '0 24px 80px rgba(15, 23, 42, 0.28)',
};

const progressStyle: React.CSSProperties = { display: 'flex', gap: 6 };
const dotStyle: React.CSSProperties = { width: 28, height: 4, borderRadius: 999, background: '#dbe3ec' };
const activeDotStyle: React.CSSProperties = { ...dotStyle, background: '#3d8a88' };
const eyebrowStyle: React.CSSProperties = { margin: '6px 0 0', color: '#64748b', fontSize: 12, fontWeight: 700 };
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 22 };
const bodyStyle: React.CSSProperties = { margin: 0, color: '#334155', lineHeight: 1.5 };
const actionsStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 };
const navStyle: React.CSSProperties = { display: 'flex', gap: 8 };
const primaryButtonStyle: React.CSSProperties = { border: 0, borderRadius: 6, padding: '10px 14px', background: '#3d8a88', color: '#fff', fontWeight: 700 };
const secondaryButtonStyle: React.CSSProperties = { border: '1px solid #cad3df', borderRadius: 6, padding: '10px 14px', background: '#fff', color: '#172033' };
const disabledButtonStyle: React.CSSProperties = { ...secondaryButtonStyle, color: '#94a3b8', cursor: 'not-allowed' };
