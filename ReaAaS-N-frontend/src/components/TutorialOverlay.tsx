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
    <div role="presentation" className="tov-backdrop">
      <section aria-labelledby="tutorial-title" className="tov-panel">
        <div className="tov-progress">
          {safeSteps.map((item, stepIndex) => (
            <span key={item.id} aria-current={stepIndex === index ? 'step' : undefined} aria-label={`Step ${stepIndex + 1}`} role="button" tabIndex={0} className={stepIndex === index ? 'tov-dot--active' : 'tov-dot'} />
          ))}
        </div>

        <p className="tov-eyebrow">
          {index + 1} / {safeSteps.length}
        </p>
        <h2 id="tutorial-title" className="tov-title">
          {step.title}
        </h2>
        <p className="tov-body">{step.body}</p>

        <footer className="tov-actions">
          <button type="button" onClick={onClose} className="tov-btn-secondary">
            Skip
          </button>
          <div className="tov-nav">
            <button type="button" disabled={isFirst} onClick={() => setIndex((current) => Math.max(0, current - 1))} className={isFirst ? 'tov-btn-disabled' : 'tov-btn-secondary'}>
              Back
            </button>
            <button type="button" onClick={isLast ? onClose : () => setIndex((current) => Math.min(safeSteps.length - 1, current + 1))} className="tov-btn-primary">
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}


