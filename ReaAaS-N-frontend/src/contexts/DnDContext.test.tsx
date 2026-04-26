import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DnDProvider, useDnD } from './DnDContext';

function DnDProbe() {
  const { dragPayload, dragType, setDrag, clearDrag } = useDnD();

  return (
    <>
      <div>{dragType ?? 'none'}</div>
      <div>{dragPayload?.label ?? 'empty'}</div>
      <button onClick={() => setDrag('h2oAlgorithm', { algorithmId: 'gbm', label: 'GBM', category: 'supervised' })}>
        set
      </button>
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
});
