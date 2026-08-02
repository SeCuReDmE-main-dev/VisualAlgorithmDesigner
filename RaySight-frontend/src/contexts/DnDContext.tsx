import { CSSProperties, createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  canArmPointer,
  dndReducer,
  initialDnDState,
  KEYBOARD_POINTER_ID,
  LEGACY_POINTER_ID,
  type DnDPhase,
  type DnDState,
  type DragPayload,
  type DropTargetState,
  type DropTargetUpdate,
  type Point,
  type PointerDescriptor,
} from './dndMachine';

export type {
  DnDPhase,
  DnDState,
  DragPayload,
  DropTargetState,
  DropTargetUpdate,
  Point,
  PointerDescriptor,
  SubpipelineEdge,
  SubpipelineNode,
} from './dndMachine';

export interface StartPointerDragOptions {
  pointerId?: number;
  pointerType?: string;
  isPrimary?: boolean;
  button?: number;
  grabOffset?: Point;
}

export interface DnDContextValue {
  dndState: DnDState;
  phase: DnDPhase;
  dragType: string | null;
  dragPayload: Readonly<DragPayload> | null;
  pointerPosition: Readonly<Point> | null;
  pointerId: number | null;
  pointerType: string | null;
  dragOrigin: Readonly<Point> | null;
  grabOffset: Readonly<Point> | null;
  dropTarget: Readonly<DropTargetState> | null;
  cancelReason: string | null;
  isPointerDragging: boolean;
  setDrag: (type: string, payload: DragPayload) => void;
  startPointerDrag: (type: string, payload: DragPayload, position: Point, options?: StartPointerDragOptions) => boolean;
  movePointerDrag: (position: Point, pointerId?: number) => void;
  setDropTarget: (target: DropTargetUpdate, pointerId?: number) => void;
  finishPointerDrag: (position: Point, target: DropTargetUpdate, pointerId?: number) => void;
  startKeyboardDrag: (type: string, payload: DragPayload, position: Point) => boolean;
  placeAtPosition: (type: string, payload: DragPayload, position: Point) => boolean;
  commitDrag: (pointerId?: number) => boolean;
  cancelDrag: (reason?: string, pointerId?: number) => void;
  resetDrag: () => void;
  clearDrag: () => void;
}

const DnDContext = createContext<DnDContextValue | null>(null);

function activeSession(state: DnDState) {
  return state.phase === 'idle' || state.phase === 'cancelled' ? null : state.session;
}

function getPointerId(state: DnDState, requestedPointerId?: number): number | null {
  if (requestedPointerId !== undefined) {
    return requestedPointerId;
  }

  return state.phase === 'idle' ? null : state.session.pointerId;
}

export function DnDProvider({ children }: { children: ReactNode }) {
  const [dndState, dispatch] = useReducer(dndReducer, initialDnDState);
  const stateRef = useRef(dndState);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const moveFrameRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<{ position: Point; pointerId: number } | null>(null);
  stateRef.current = dndState;
  const session = activeSession(dndState);

  const setDrag = useCallback((type: string, payload: DragPayload) => {
    dispatch({
      type: 'ARM',
      request: {
        dragType: type,
        payload,
        pointer: {
          id: LEGACY_POINTER_ID,
          type: 'legacy',
          isPrimary: true,
          button: 0,
        },
        origin: { x: 0, y: 0 },
      },
    });
  }, []);

  const startPointerDrag = useCallback(
    (type: string, payload: DragPayload, position: Point, options: StartPointerDragOptions = {}) => {
      const pointer: PointerDescriptor = {
        id: options.pointerId ?? 1,
        type: options.pointerType ?? 'mouse',
        isPrimary: options.isPrimary ?? true,
        button: options.button ?? 0,
      };

      const current = stateRef.current;
      if ((current.phase !== 'idle' && current.phase !== 'cancelled') || !canArmPointer(pointer)) {
        return false;
      }

      dispatch({
        type: 'ARM',
        request: {
          dragType: type,
          payload,
          pointer,
          origin: position,
          grabOffset: options.grabOffset,
        },
      });
      return true;
    },
    [],
  );

  const movePointerDrag = useCallback(
    (position: Point, requestedPointerId?: number) => {
      const pointerId = getPointerId(stateRef.current, requestedPointerId);
      if (pointerId !== null) {
        pendingMoveRef.current = { pointerId, position };
        if (moveFrameRef.current === null) {
          moveFrameRef.current = window.requestAnimationFrame(() => {
            moveFrameRef.current = null;
            const pending = pendingMoveRef.current;
            pendingMoveRef.current = null;
            if (pending) {
              dispatch({ type: 'MOVE', ...pending });
              if (previewRef.current) {
                const session = stateRef.current.phase === 'idle' ? null : stateRef.current.session;
                const offset = session?.grabOffset ?? { x: 0, y: 0 };
                previewRef.current.style.transform = `translate3d(${pending.position.x - offset.x + 12}px, ${pending.position.y - offset.y + 12}px, 0)`;
              }
            }
          });
        }
      }
    },
    [],
  );

  const setDropTarget = useCallback(
    (target: DropTargetUpdate, requestedPointerId?: number) => {
      const pointerId = getPointerId(stateRef.current, requestedPointerId);
      if (pointerId !== null) {
        dispatch({ type: 'SET_TARGET', pointerId, target });
      }
    },
    [],
  );

  const finishPointerDrag = useCallback((position: Point, target: DropTargetUpdate, requestedPointerId?: number) => {
    const pointerId = getPointerId(stateRef.current, requestedPointerId);
    if (pointerId !== null) {
      if (moveFrameRef.current !== null) {
        window.cancelAnimationFrame(moveFrameRef.current);
        moveFrameRef.current = null;
        pendingMoveRef.current = null;
      }
      dispatch({ type: 'DROP', pointerId, position, target });
    }
  }, []);

  const queueKeyboardSession = useCallback((type: string, payload: DragPayload, position: Point, commit: boolean) => {
    const current = stateRef.current;
    if (current.phase !== 'idle' && current.phase !== 'cancelled') {
      return false;
    }

    const origin = { x: position.x - 6, y: position.y };
    dispatch({
      type: 'ARM',
      request: {
        dragType: type,
        payload,
        pointer: { id: KEYBOARD_POINTER_ID, type: 'keyboard', isPrimary: true, button: 0 },
        origin,
      },
    });
    dispatch({ type: 'MOVE', pointerId: KEYBOARD_POINTER_ID, position });
    dispatch({ type: 'SET_TARGET', pointerId: KEYBOARD_POINTER_ID, target: { validity: 'valid', targetId: 'algorithm-canvas' } });
    if (commit) {
      dispatch({ type: 'COMMIT', pointerId: KEYBOARD_POINTER_ID });
    }
    return true;
  }, []);

  const startKeyboardDrag = useCallback(
    (type: string, payload: DragPayload, position: Point) => queueKeyboardSession(type, payload, position, false),
    [queueKeyboardSession],
  );
  const placeAtPosition = useCallback(
    (type: string, payload: DragPayload, position: Point) => queueKeyboardSession(type, payload, position, true),
    [queueKeyboardSession],
  );

  const commitDrag = useCallback(
    (requestedPointerId?: number) => {
      const current = stateRef.current;
      const pointerId = getPointerId(current, requestedPointerId);
      const canCommit =
        pointerId !== null &&
        current.phase === 'dragging' &&
        current.session.pointerId === pointerId &&
        current.session.target.validity === 'valid';

      if (canCommit) {
        dispatch({ type: 'COMMIT', pointerId });
      }

      return canCommit;
    },
    [],
  );

  const cancelDrag = useCallback(
    (reason = 'cancelled', requestedPointerId?: number) => {
      const pointerId = getPointerId(stateRef.current, requestedPointerId);
      dispatch({
        type: 'CANCEL',
        ...(pointerId === null ? {} : { pointerId }),
        reason,
      });
    },
    [],
  );

  const resetDrag = useCallback(() => dispatch({ type: 'RESET' }), []);

  useEffect(() => {
    const cancelActive = (reason: string) => {
      const current = stateRef.current;
      if (current.phase !== 'idle' && current.phase !== 'cancelled') {
        dispatch({ type: 'CANCEL', pointerId: current.session.pointerId, reason });
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancelActive('escape');
    };
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') cancelActive('document-hidden');
    };
    const onBlur = () => cancelActive('window-blur');

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      if (moveFrameRef.current !== null) window.cancelAnimationFrame(moveFrameRef.current);
    };
  }, []);

  const value = useMemo<DnDContextValue>(
    () => ({
      dndState,
      phase: dndState.phase,
      dragType: session?.dragType ?? null,
      dragPayload: session?.payload ?? null,
      pointerPosition: session && session.pointerId !== LEGACY_POINTER_ID ? session.current : null,
      pointerId: session?.pointerId ?? null,
      pointerType: session?.pointerType ?? null,
      dragOrigin: session?.origin ?? null,
      grabOffset: session?.grabOffset ?? null,
      dropTarget: dndState.phase === 'idle' ? null : dndState.session.target,
      cancelReason: dndState.cancelReason,
      isPointerDragging: dndState.phase === 'dragging',
      setDrag,
      startPointerDrag,
      movePointerDrag,
      setDropTarget,
      finishPointerDrag,
      startKeyboardDrag,
      placeAtPosition,
      commitDrag,
      cancelDrag,
      resetDrag,
      clearDrag: resetDrag,
    }),
    [cancelDrag, commitDrag, dndState, finishPointerDrag, movePointerDrag, placeAtPosition, resetDrag, session, setDrag, setDropTarget, startKeyboardDrag, startPointerDrag],
  );

  const announcement =
    dndState.phase === 'armed'
      ? `${dndState.session.payload.label}: move to start dragging.`
      : dndState.phase === 'dragging' && dndState.session.target.validity === 'valid'
        ? `${dndState.session.payload.label}: release to place.`
        : dndState.phase === 'dragging' && dndState.session.target.validity === 'invalid'
          ? `${dndState.session.payload.label}: ${dndState.session.target.reason}.`
          : '';

  return (
    <DnDContext.Provider value={value}>
      {children}
      <span
        aria-live="polite"
        role="status"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announcement}
      </span>
      {dndState.phase === 'dragging' && (
        <div
          ref={previewRef}
          className="vad-drag-preview"
          data-drop-validity={dndState.session.target.validity}
          style={
            {
              '--vad-drag-x': '0px',
              '--vad-drag-y': '0px',
              transform: `translate3d(${dndState.session.current.x - dndState.session.grabOffset.x + 12}px, ${dndState.session.current.y - dndState.session.grabOffset.y + 12}px, 0)`,
            } as CSSProperties
          }
          aria-hidden="true"
        >
          <span className="vad-drag-preview__handle">⋮⋮</span>
          <span className="vad-drag-preview__label">{dndState.session.payload.label}</span>
          <span className="vad-drag-preview__category">{dndState.session.payload.category}</span>
        </div>
      )}
    </DnDContext.Provider>
  );
}

export function useDnD() {
  const context = useContext(DnDContext);

  if (!context) {
    throw new Error('useDnD must be used within DnDProvider');
  }

  return context;
}
