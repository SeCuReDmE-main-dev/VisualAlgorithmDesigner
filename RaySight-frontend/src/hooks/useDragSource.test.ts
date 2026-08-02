import { resolveCanvasDropTarget } from './useDragSource';

describe('resolveCanvasDropTarget', () => {
  const mockElementFromPoint = (element: Element | null) => {
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: vi.fn(() => element),
    });
  };

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(document, 'elementFromPoint');
  });

  it('accepts the canvas drop surface', () => {
    const canvas = document.createElement('div');
    canvas.dataset.testid = 'algorithm-canvas-drop-surface';
    const child = document.createElement('span');
    canvas.append(child);
    document.body.append(canvas);
    mockElementFromPoint(child);

    expect(resolveCanvasDropTarget(20, 20)).toEqual({ validity: 'valid', targetId: 'algorithm-canvas' });
    canvas.remove();
  });

  it('rejects canvas controls even when nested in the canvas', () => {
    const canvas = document.createElement('div');
    canvas.dataset.testid = 'algorithm-canvas-drop-surface';
    const controls = document.createElement('div');
    controls.className = 'react-flow__controls';
    canvas.append(controls);
    document.body.append(canvas);
    mockElementFromPoint(controls);

    expect(resolveCanvasDropTarget(20, 20)).toMatchObject({ validity: 'invalid' });
    canvas.remove();
  });

  it('rejects points outside the canvas', () => {
    mockElementFromPoint(null);
    expect(resolveCanvasDropTarget(20, 20)).toMatchObject({ validity: 'invalid' });
  });
});
