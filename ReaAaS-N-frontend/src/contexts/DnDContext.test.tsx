import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DnDProvider, useDnD } from './DnDContext';

function DnDProbe() {
  const { dragPayload, dragType, pointerPosition, isPointerDragging, setDrag, startPointerDrag, movePointerDrag, clearDrag } = useDnD();

  return (
    <>
      <div>{dragType ?? 'none'}</div>
      <div>{dragPayload?.label ?? 'empty'}</div>
      <div>{isPointerDragging ? 'pointer-active' : 'pointer-idle'}</div>
      <div>{pointerPosition ? `${pointerPosition.x},${pointerPosition.y}` : 'no-position'}</div>
      <button onClick={() => setDrag('h2oAlgorithm', { algorithmId: 'gbm', label: 'GBM', category: 'supervised' })}>
        set
      </button>
      <button onClick={() => startPointerDrag('algorithm', { algorithmId: 'glm', label: 'GLM', category: 'supervised' }, { x: 10, y: 20 })}>
        start pointer
      </button>
      <button onClick={() => movePointerDrag({ x: 30, y: 40 })}>move pointer</button>
      <button onClick={clearDrag}>clear</button>
    </>
  );
}

describe('DnDContext', () => {
  it('stores and clears the current drag payload', async () => {
    const user = userEvent.setup();
    render(
      <DnDProvider>
        <DnDProbe />
      </DnDProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'set' }));
    expect(screen.getByText('h2oAlgorithm')).toBeInTheDocument();
    expect(screen.getByText('GBM')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.getByText('none')).toBeInTheDocument();
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('tracks pointer drag preview state', async () => {
    const user = userEvent.setup();
    render(
      <DnDProvider>
        <DnDProbe />
      </DnDProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'start pointer' }));
    expect(screen.getByText('algorithm')).toBeInTheDocument();
    expect(screen.getAllByText('GLM')).toHaveLength(2);
    expect(screen.getByText('pointer-active')).toBeInTheDocument();
    expect(screen.getByText('10,20')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'move pointer' }));
    expect(screen.getByText('30,40')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.getByText('pointer-idle')).toBeInTheDocument();
    expect(screen.getByText('no-position')).toBeInTheDocument();
  });
});
