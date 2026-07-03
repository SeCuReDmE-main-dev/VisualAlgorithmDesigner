import { useMemo, useState } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  body: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'palette', title: 'Explore a block', body: 'Start from the palette and choose the algorithm idea you want to understand.' },
  { id: 'canvas', title: 'Build the flow', body: 'Drop blocks on the canvas and connect them from one decision to the next.' },
  { id: 'params', title: 'Tune the idea', body: 'Select a block to review its purpose, example, history, and learning settings.' },
  { id: 'explain', title: 'Ask RaySight', body: 'Use the guide panel to explain the selected block or the full VAD pipeline.' },
  { id: 'save', title: 'Save your work', body: 'Save reusable pipelines locally so you can continue later.' },
  { id: 'evaluate', title: 'Evaluate coherence', body: 'Run a review and inspect weak points before sharing a classroom example.' },
  { id: 'promote', title: 'Validate strong work', body: 'Teacher mode can save strong pipelines to a validated classroom catalog.' },
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
        <div className="tov-progress" role="tablist" aria-label="Tutorial steps">
          {safeSteps.map((item, stepIndex) => (
            <span
              key={item.id}
              role="tab"
              tabIndex={0}
              aria-selected={stepIndex === index}
              aria-label={`Step ${stepIndex + 1}: ${item.title}`}
              className={stepIndex === index ? 'tov-dot--active' : 'tov-dot'}
              onClick={() => setIndex(stepIndex)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIndex(stepIndex);
                }
              }}
            />
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


