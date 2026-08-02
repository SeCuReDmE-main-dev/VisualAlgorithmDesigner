import {
  DRAG_ACTIVATION_DISTANCE_PX,
  canArmPointer,
  dndReducer,
  hasCrossedDragThreshold,
  initialDnDState,
  type ArmDragRequest,
  type DnDState,
  type DragPayload,
} from './dndMachine';

const payload: DragPayload = {
  algorithmId: 'search',
  label: 'Search',
  category: 'search',
};

function armRequest(overrides: Partial<ArmDragRequest> = {}): ArmDragRequest {
  return {
    dragType: 'algorithm',
    payload,
    pointer: { id: 7, type: 'pen', isPrimary: true, button: 0 },
    origin: { x: 10, y: 20 },
    grabOffset: { x: 3, y: 4 },
    ...overrides,
  };
}

function arm(overrides: Partial<ArmDragRequest> = {}): DnDState {
  return dndReducer(initialDnDState, { type: 'ARM', request: armRequest(overrides) });
}

function startDragging(state = arm()): DnDState {
  return dndReducer(state, { type: 'MOVE', pointerId: 7, position: { x: 16, y: 20 } });
}

describe('dndMachine pointer policy', () => {
  it('accepts only a finite, primary, left-button pointer', () => {
    expect(canArmPointer({ id: 1, type: 'mouse', isPrimary: true, button: 0 })).toBe(true);
    expect(canArmPointer({ id: 1, type: 'touch', isPrimary: false, button: 0 })).toBe(false);
    expect(canArmPointer({ id: 1, type: 'mouse', isPrimary: true, button: 2 })).toBe(false);
    expect(canArmPointer({ id: Number.NaN, type: 'pen', isPrimary: true, button: 0 })).toBe(false);
  });

  it('uses an inclusive Euclidean six-pixel activation threshold', () => {
    expect(DRAG_ACTIVATION_DISTANCE_PX).toBe(6);
    expect(hasCrossedDragThreshold({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(false);
    expect(hasCrossedDragThreshold({ x: 0, y: 0 }, { x: 5.99, y: 0 })).toBe(false);
    expect(hasCrossedDragThreshold({ x: 0, y: 0 }, { x: 6, y: 0 })).toBe(true);
    expect(hasCrossedDragThreshold({ x: 0, y: 0 }, { x: -6, y: 0 })).toBe(true);
  });
});

describe('dndReducer', () => {
  it('starts idle', () => {
    expect(initialDnDState).toEqual({ phase: 'idle', session: null, cancelReason: null });
    expect(Object.isFrozen(initialDnDState)).toBe(true);
  });

  it('arms a primary pointer with all immutable session data', () => {
    const sourcePayload: DragPayload = {
      ...payload,
      prefabNodes: [
        {
          id: 'source',
          type: 'algorithmNode',
          position: { x: 1, y: 2 },
          data: { params: { depth: 2 } },
        },
      ],
    };
    const state = arm({ payload: sourcePayload });

    expect(state.phase).toBe('armed');
    if (state.phase !== 'armed') {
      throw new Error('Expected an armed state');
    }

    expect(state.session).toMatchObject({
      dragType: 'algorithm',
      pointerId: 7,
      pointerType: 'pen',
      origin: { x: 10, y: 20 },
      current: { x: 10, y: 20 },
      grabOffset: { x: 3, y: 4 },
      target: { validity: 'unknown', targetId: null, reason: null },
    });
    expect(state.session.payload).not.toBe(sourcePayload);
    expect(Object.isFrozen(state.session.payload)).toBe(true);
    expect(Object.isFrozen(state.session.payload.prefabNodes)).toBe(true);
    expect(Object.isFrozen(state.session.payload.prefabNodes?.[0].data.params)).toBe(true);

    const sourceParams = sourcePayload.prefabNodes?.[0].data.params as { depth: number };
    sourceParams.depth = 99;
    expect(state.session.payload.prefabNodes?.[0].data.params).toEqual({ depth: 2 });
  });

  it.each([
    ['secondary pointer', { id: 7, type: 'touch', isPrimary: false, button: 0 }],
    ['right button', { id: 7, type: 'mouse', isPrimary: true, button: 2 }],
  ])('ignores an ARM from a %s', (_label, pointer) => {
    const state = arm({ pointer });
    expect(state).toBe(initialDnDState);
  });

  it('ignores invalid arm coordinates and an empty drag type', () => {
    expect(arm({ origin: { x: Number.NaN, y: 0 } })).toBe(initialDnDState);
    expect(arm({ grabOffset: { x: 0, y: Number.POSITIVE_INFINITY } })).toBe(initialDnDState);
    expect(arm({ dragType: '   ' })).toBe(initialDnDState);
  });

  it('does not let another ARM replace an active pointer session', () => {
    const armed = arm();
    const replacement = dndReducer(armed, {
      type: 'ARM',
      request: armRequest({ pointer: { id: 99, type: 'mouse', isPrimary: true, button: 0 } }),
    });

    expect(replacement).toBe(armed);
    expect(replacement.session?.pointerId).toBe(7);
  });

  it('stays armed below the threshold and becomes dragging at six pixels', () => {
    const armed = arm();
    const belowThreshold = dndReducer(armed, { type: 'MOVE', pointerId: 7, position: { x: 13, y: 24 } });
    const dragging = dndReducer(belowThreshold, { type: 'MOVE', pointerId: 7, position: { x: 16, y: 20 } });

    expect(belowThreshold.phase).toBe('armed');
    expect(belowThreshold.session?.current).toEqual({ x: 13, y: 24 });
    expect(dragging.phase).toBe('dragging');
    expect(dragging.session?.current).toEqual({ x: 16, y: 20 });
  });

  it('tracks subsequent drag motion without changing its origin', () => {
    const dragging = startDragging();
    const moved = dndReducer(dragging, { type: 'MOVE', pointerId: 7, position: { x: 80, y: 90 } });

    expect(moved.phase).toBe('dragging');
    expect(moved.session?.origin).toEqual({ x: 10, y: 20 });
    expect(moved.session?.current).toEqual({ x: 80, y: 90 });
  });

  it('ignores motion from another pointer and non-finite motion', () => {
    const armed = arm();
    expect(dndReducer(armed, { type: 'MOVE', pointerId: 8, position: { x: 30, y: 40 } })).toBe(armed);
    expect(dndReducer(armed, { type: 'MOVE', pointerId: 7, position: { x: Number.NaN, y: 40 } })).toBe(armed);
  });

  it('records valid, invalid, and unknown target states only while dragging', () => {
    const armed = arm();
    const dragging = startDragging(armed);

    expect(
      dndReducer(armed, {
        type: 'SET_TARGET',
        pointerId: 7,
        target: { validity: 'valid', targetId: 'canvas' },
      }),
    ).toBe(armed);

    const valid = dndReducer(dragging, {
      type: 'SET_TARGET',
      pointerId: 7,
      target: { validity: 'valid', targetId: 'canvas', reason: 'discarded' },
    });
    expect(valid.session?.target).toEqual({ validity: 'valid', targetId: 'canvas', reason: null });
    expect(
      dndReducer(valid, {
        type: 'SET_TARGET',
        pointerId: 8,
        target: { validity: 'invalid', reason: 'wrong pointer' },
      }),
    ).toBe(valid);

    const invalid = dndReducer(valid, {
      type: 'SET_TARGET',
      pointerId: 7,
      target: { validity: 'invalid', targetId: 'minimap', reason: 'Canvas controls cannot receive a drop' },
    });
    expect(invalid.session?.target).toEqual({
      validity: 'invalid',
      targetId: 'minimap',
      reason: 'Canvas controls cannot receive a drop',
    });

    const unknown = dndReducer(invalid, {
      type: 'SET_TARGET',
      pointerId: 7,
      target: { validity: 'unknown', reason: 'discarded' },
    });
    expect(unknown.session?.target).toEqual({ validity: 'unknown', targetId: null, reason: null });
  });

  it('supplies a deterministic reason for an invalid target', () => {
    const dragging = startDragging();
    const invalid = dndReducer(dragging, {
      type: 'SET_TARGET',
      pointerId: 7,
      target: { validity: 'invalid', reason: '   ' },
    });

    expect(invalid.session?.target.reason).toBe('invalid-target');
  });

  it('commits only a valid target owned by the active pointer', () => {
    const dragging = startDragging();
    const unknownCommit = dndReducer(dragging, { type: 'COMMIT', pointerId: 7 });
    const valid = dndReducer(dragging, {
      type: 'SET_TARGET',
      pointerId: 7,
      target: { validity: 'valid', targetId: 'canvas' },
    });

    expect(unknownCommit).toBe(dragging);
    expect(dndReducer(valid, { type: 'COMMIT', pointerId: 8 })).toBe(valid);
    expect(dndReducer(valid, { type: 'COMMIT', pointerId: 7 }).phase).toBe('committing');
  });

  it('finishes pointer-up atomically with its final valid target', () => {
    const dropped = dndReducer(arm(), {
      type: 'DROP',
      pointerId: 7,
      position: { x: 30, y: 40 },
      target: { validity: 'valid', targetId: 'canvas' },
    });
    expect(dropped.phase).toBe('committing');
    expect(dropped.session?.current).toEqual({ x: 30, y: 40 });
    expect(dropped.session?.target.validity).toBe('valid');
  });

  it('cancels an atomic drop below threshold or over an invalid target', () => {
    const belowThreshold = dndReducer(arm(), {
      type: 'DROP',
      pointerId: 7,
      position: { x: 12, y: 20 },
      target: { validity: 'valid', targetId: 'canvas' },
    });
    const invalid = dndReducer(startDragging(), {
      type: 'DROP',
      pointerId: 7,
      position: { x: 40, y: 40 },
      target: { validity: 'invalid', reason: 'controls' },
    });
    expect(belowThreshold).toMatchObject({ phase: 'cancelled', cancelReason: 'movement-threshold-not-reached' });
    expect(invalid).toMatchObject({ phase: 'cancelled', cancelReason: 'controls' });
  });

  it.each(['armed', 'dragging', 'committing'] as const)('can cancel the %s phase and retain diagnostics', (phase) => {
    let state = arm();
    if (phase === 'dragging' || phase === 'committing') {
      state = startDragging(state);
    }
    if (phase === 'committing') {
      state = dndReducer(state, {
        type: 'SET_TARGET',
        pointerId: 7,
        target: { validity: 'valid', targetId: 'canvas' },
      });
      state = dndReducer(state, { type: 'COMMIT', pointerId: 7 });
    }

    const cancelled = dndReducer(state, { type: 'CANCEL', pointerId: 7, reason: 'pointer-cancelled' });
    expect(cancelled.phase).toBe('cancelled');
    expect(cancelled.cancelReason).toBe('pointer-cancelled');
    expect(cancelled.session?.pointerId).toBe(7);
  });

  it('ignores cancellation by a different pointer and makes cancellation idempotent', () => {
    const dragging = startDragging();
    expect(dndReducer(dragging, { type: 'CANCEL', pointerId: 8, reason: 'wrong-pointer' })).toBe(dragging);

    const cancelled = dndReducer(dragging, { type: 'CANCEL', pointerId: 7, reason: 'escape' });
    expect(dndReducer(cancelled, { type: 'CANCEL', pointerId: 7, reason: 'again' })).toBe(cancelled);
  });

  it('resets every phase and permits a fresh arm after cancellation', () => {
    const cancelled = dndReducer(startDragging(), { type: 'CANCEL', pointerId: 7, reason: 'escape' });
    const rearmed = dndReducer(cancelled, {
      type: 'ARM',
      request: armRequest({ pointer: { id: 11, type: 'touch', isPrimary: true, button: 0 } }),
    });

    expect(rearmed.phase).toBe('armed');
    expect(rearmed.session?.pointerId).toBe(11);
    expect(dndReducer(rearmed, { type: 'RESET' })).toBe(initialDnDState);
    expect(dndReducer(startDragging(), { type: 'RESET' })).toBe(initialDnDState);
    expect(dndReducer(initialDnDState, { type: 'RESET' })).toBe(initialDnDState);
  });
});
