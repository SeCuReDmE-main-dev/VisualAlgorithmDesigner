import { useCallback, useEffect, useMemo, useRef } from 'react';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import {
  useDnD,
  type DragPayload,
  type DropTargetUpdate,
  type Point,
} from '../contexts/DnDContext';

const CANVAS_SELECTOR = '[data-testid="algorithm-canvas-drop-surface"]';
const EXCLUDED_DROP_SELECTOR = [
  '[data-vad-drop-exclude="true"]',
  '.react-flow__controls',
  '.react-flow__minimap',
  '[role="dialog"]',
  '[role="menu"]',
  '[aria-modal="true"]',
].join(',');
const KEYBOARD_POINTER_ID = -2;
const GRID_SIZE = 20;

export interface DragSourceOptions {
  type: string;
  payload: DragPayload;
}

export function resolveCanvasDropTarget(x: number, y: number): DropTargetUpdate {
  const hit = document.elementFromPoint(x, y);
  if (!hit) {
    return { validity: 'invalid', targetId: null, reason: 'Outside the canvas.' };
  }
  if (hit.closest(EXCLUDED_DROP_SELECTOR)) {
    return { validity: 'invalid', targetId: null, reason: 'Controls and overlays cannot receive a drop.' };
  }
  if (hit.closest(CANVAS_SELECTOR)) {
    return { validity: 'valid', targetId: 'algorithm-canvas' };
  }
  return { validity: 'invalid', targetId: null, reason: 'Move onto the canvas to place this block.' };
}

function canvasCenter(): Point | null {
  const canvas = document.querySelector<HTMLElement>(CANVAS_SELECTOR);
  const bounds = canvas?.getBoundingClientRect();
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null;
  return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
}

function clampToCanvas(point: Point): Point {
  const canvas = document.querySelector<HTMLElement>(CANVAS_SELECTOR);
  const bounds = canvas?.getBoundingClientRect();
  if (!bounds) return point;
  return {
    x: Math.min(bounds.right - GRID_SIZE, Math.max(bounds.left + GRID_SIZE, point.x)),
    y: Math.min(bounds.bottom - GRID_SIZE, Math.max(bounds.top + GRID_SIZE, point.y)),
  };
}

export function useDragSource({ type, payload }: DragSourceOptions) {
  const {
    phase,
    dragPayload,
    pointerPosition,
    pointerType,
    startPointerDrag,
    movePointerDrag,
    setDropTarget,
    finishPointerDrag,
    startKeyboardDrag,
    placeAtPosition,
    commitDrag,
    cancelDrag,
  } = useDnD();
  const ownedPointerRef = useRef<number | null>(null);

  useEffect(() => () => {
    const pointerId = ownedPointerRef.current;
    if (pointerId !== null) cancelDrag('drag-source-unmounted', pointerId);
  }, [cancelDrag]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const started = startPointerDrag(
      type,
      payload,
      { x: event.clientX, y: event.clientY },
      {
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        isPrimary: event.isPrimary,
        button: event.button,
        grabOffset: { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
      },
    );
    if (!started) return;
    event.preventDefault();
    ownedPointerRef.current = event.pointerId;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic accessibility tests may not register an OS-level pointer;
      // the state machine still preserves pointer ownership.
    }
  }, [payload, startPointerDrag, type]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (ownedPointerRef.current !== event.pointerId) return;
    event.preventDefault();
    const position = { x: event.clientX, y: event.clientY };
    movePointerDrag(position, event.pointerId);
    setDropTarget(resolveCanvasDropTarget(position.x, position.y), event.pointerId);
  }, [movePointerDrag, setDropTarget]);

  const releaseOwnedPointer = useCallback((element: HTMLElement, pointerId: number) => {
    ownedPointerRef.current = null;
    try {
      if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
    } catch {
      // The browser may already have released a cancelled pointer.
    }
  }, []);

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (ownedPointerRef.current !== event.pointerId) return;
    const position = { x: event.clientX, y: event.clientY };
    finishPointerDrag(position, resolveCanvasDropTarget(position.x, position.y), event.pointerId);
    releaseOwnedPointer(event.currentTarget, event.pointerId);
  }, [finishPointerDrag, releaseOwnedPointer]);

  const handlePointerCancel = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (ownedPointerRef.current !== event.pointerId) return;
    cancelDrag('pointer-cancelled', event.pointerId);
    releaseOwnedPointer(event.currentTarget, event.pointerId);
  }, [cancelDrag, releaseOwnedPointer]);

  const handleLostPointerCapture = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (ownedPointerRef.current !== event.pointerId) return;
    ownedPointerRef.current = null;
    cancelDrag('pointer-capture-lost', event.pointerId);
  }, [cancelDrag]);

  const ownsKeyboardSession = pointerType === 'keyboard'
    && dragPayload?.algorithmId === payload.algorithmId
    && (phase === 'armed' || phase === 'dragging');

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLElement>) => {
    if (!ownsKeyboardSession && (event.key === 'Enter' || event.key === ' ')) {
      const center = canvasCenter();
      if (center && startKeyboardDrag(type, payload, center)) event.preventDefault();
      return;
    }
    if (!ownsKeyboardSession) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      cancelDrag('escape', KEYBOARD_POINTER_ID);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      commitDrag(KEYBOARD_POINTER_ID);
      return;
    }

    const directions: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const direction = directions[event.key];
    if (!direction || !pointerPosition) return;
    event.preventDefault();
    const distance = GRID_SIZE * (event.shiftKey ? 5 : 1);
    const next = clampToCanvas({
      x: pointerPosition.x + direction.x * distance,
      y: pointerPosition.y + direction.y * distance,
    });
    movePointerDrag(next, KEYBOARD_POINTER_ID);
    setDropTarget({ validity: 'valid', targetId: 'algorithm-canvas' }, KEYBOARD_POINTER_ID);
  }, [cancelDrag, commitDrag, movePointerDrag, ownsKeyboardSession, payload, pointerPosition, setDropTarget, startKeyboardDrag, type]);

  const placeAtCenter = useCallback(() => {
    const center = canvasCenter();
    return center ? placeAtPosition(type, payload, center) : false;
  }, [payload, placeAtPosition, type]);

  return useMemo(() => ({
    dragHandleProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onLostPointerCapture: handleLostPointerCapture,
      onKeyDown: handleKeyDown,
      tabIndex: 0,
      role: 'button' as const,
      'aria-pressed': ownsKeyboardSession,
    },
    placeAtCenter,
    ownsKeyboardSession,
  }), [handleKeyDown, handleLostPointerCapture, handlePointerCancel, handlePointerDown, handlePointerMove, handlePointerUp, ownsKeyboardSession, placeAtCenter]);
}
