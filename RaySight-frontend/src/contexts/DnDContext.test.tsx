import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DnDProvider, useDnD } from './DnDContext';

function DnDProbe() {
  const {
    phase,
    dragPayload,
    dragType,
    pointerPosition,
    pointerId,
    pointerType,
    dropTarget,
    cancelReason,
    isPointerDragging,
    setDrag,
    startPointerDrag,
    movePointerDrag,
    setDropTarget,
    commitDrag,
    cancelDrag,
    clearDrag,
  } = useDnD();

  return (
    <>
      <div data-testid="phase">{phase}</div>
      <div>{dragType ?? 'none'}</div>
      <div>{dragPayload?.label ?? 'empty'}</div>
      <div>{isPointerDragging ? 'pointer-active' : 'pointer-idle'}</div>
      <div>{pointerPosition ? `${pointerPosition.x},${pointerPosition.y}` : 'no-position'}</div>
      <div>{pointerId === null ? 'no-pointer' : `pointer-${pointerId}`}</div>
      <div>{pointerType ?? 'no-pointer-type'}</div>
      <div>{dropTarget ? `${dropTarget.validity}:${dropTarget.reason ?? 'ok'}` : 'no-target'}</div>
      <div>{cancelReason ?? 'not-cancelled'}</div>
      <button onClick={() => setDrag('learningAlgorithm', { algorithmId: 'classification', label: 'Classification', category: 'classification' })}>
        set
      </button>
      <button
        onClick={() =>
          startPointerDrag(
            'algorithm',
            { algorithmId: 'search', label: 'Search', category: 'search' },
            { x: 10, y: 20 },
            { pointerId: 17, pointerType: 'touch', isPrimary: true, button: 0, grabOffset: { x: 2, y: 3 } },
          )
        }
      >
        start pointer
      </button>
      <button
        onClick={() =>
          startPointerDrag(
            'algorithm',
            { algorithmId: 'sort', label: 'Sort', category: 'sorting' },
            { x: 10, y: 20 },
            { pointerId: 18, pointerType: 'touch', isPrimary: false, button: 0 },
          )
        }
      >
        start secondary pointer
      </button>
      <button onClick={() => movePointerDrag({ x: 13, y: 24 }, 17)}>move below threshold</button>
      <button onClick={() => movePointerDrag({ x: 16, y: 20 }, 17)}>move to threshold</button>
      <button onClick={() => setDropTarget({ validity: 'valid', targetId: 'canvas' }, 17)}>valid target</button>
      <button onClick={() => setDropTarget({ validity: 'invalid', targetId: 'minimap', reason: 'invalid surface' }, 17)}>invalid target</button>
      <button onClick={() => commitDrag(17)}>commit</button>
      <button onClick={() => cancelDrag('escape', 17)}>cancel</button>
      <button onClick={clearDrag}>clear</button>
    </>
  );
}

describe('DnDContext', () => {
  it('keeps the legacy payload API and clears it through RESET', async () => {
    const user = userEvent.setup();
    render(
      <DnDProvider>
        <DnDProbe />
      </DnDProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'set' }));
    expect(screen.getByTestId('phase')).toHaveTextContent('armed');
    expect(screen.getByText('learningAlgorithm')).toBeInTheDocument();
    expect(screen.getByText('Classification')).toBeInTheDocument();
    expect(screen.getByText('no-position')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.getByTestId('phase')).toHaveTextContent('idle');
    expect(screen.getByText('none')).toBeInTheDocument();
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('arms first and activates the preview only at the six-pixel threshold', async () => {
    const user = userEvent.setup();
    render(
      <DnDProvider>
        <DnDProbe />
      </DnDProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'start pointer' }));
    expect(screen.getByTestId('phase')).toHaveTextContent('armed');
    expect(screen.getByText('algorithm')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('pointer-idle')).toBeInTheDocument();
    expect(screen.getByText('10,20')).toBeInTheDocument();
    expect(screen.getByText('pointer-17')).toBeInTheDocument();
    expect(screen.getByText('touch')).toBeInTheDocument();
    expect(document.querySelector('.vad-drag-preview')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'move below threshold' }));
    expect(screen.getByTestId('phase')).toHaveTextContent('armed');
    await waitFor(() => expect(screen.getByText('13,24')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'move to threshold' }));
    await waitFor(() => expect(screen.getByTestId('phase')).toHaveTextContent('dragging'));
    expect(screen.getByText('pointer-active')).toBeInTheDocument();
    expect(screen.getAllByText('Search')).toHaveLength(2);
    expect(document.querySelector('.vad-drag-preview')).toHaveAttribute('data-drop-validity', 'unknown');
  });

  it('rejects a secondary pointer before creating a session', async () => {
    const user = userEvent.setup();
    render(
      <DnDProvider>
        <DnDProbe />
      </DnDProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'start secondary pointer' }));
    expect(screen.getByTestId('phase')).toHaveTextContent('idle');
    expect(screen.getByText('empty')).toBeInTheDocument();
    expect(screen.getByText('no-pointer')).toBeInTheDocument();
  });

  it('tracks target validity and commits only a valid target', async () => {
    const user = userEvent.setup();
    render(
      <DnDProvider>
        <DnDProbe />
      </DnDProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'start pointer' }));
    await user.click(screen.getByRole('button', { name: 'move to threshold' }));
    await user.click(screen.getByRole('button', { name: 'invalid target' }));
    expect(screen.getByText('invalid:invalid surface')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'commit' }));
    expect(screen.getByTestId('phase')).toHaveTextContent('dragging');

    await user.click(screen.getByRole('button', { name: 'valid target' }));
    expect(screen.getByText('valid:ok')).toBeInTheDocument();
    expect(document.querySelector('.vad-drag-preview')).toHaveAttribute('data-drop-validity', 'valid');

    await user.click(screen.getByRole('button', { name: 'commit' }));
    expect(screen.getByTestId('phase')).toHaveTextContent('committing');
    expect(screen.getByText('pointer-idle')).toBeInTheDocument();
    expect(document.querySelector('.vad-drag-preview')).not.toBeInTheDocument();
  });

  it('retains cancellation diagnostics while hiding the legacy active fields', async () => {
    const user = userEvent.setup();
    render(
      <DnDProvider>
        <DnDProbe />
      </DnDProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'start pointer' }));
    await user.click(screen.getByRole('button', { name: 'cancel' }));

    expect(screen.getByTestId('phase')).toHaveTextContent('cancelled');
    expect(screen.getByText('escape')).toBeInTheDocument();
    expect(screen.getByText('none')).toBeInTheDocument();
    expect(screen.getByText('empty')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.getByTestId('phase')).toHaveTextContent('idle');
    expect(screen.getByText('not-cancelled')).toBeInTheDocument();
  });
});
