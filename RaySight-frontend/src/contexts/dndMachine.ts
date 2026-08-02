export interface Point {
  x: number;
  y: number;
}

export interface SubpipelineNode extends Record<string, unknown> {
  id: string;
  type: string;
  position: Point;
  data: Record<string, unknown>;
}

export interface SubpipelineEdge extends Record<string, unknown> {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface DragPayload {
  algorithmId: string;
  label: string;
  category: string;
  isPrefab?: boolean;
  prefabNodes?: SubpipelineNode[];
  prefabEdges?: SubpipelineEdge[];
  isValidated?: boolean;
  coherenceScore?: number;
  loopCapable?: boolean;
  nodeData?: Record<string, unknown>;
}

export const DRAG_ACTIVATION_DISTANCE_PX = 6;
export const LEGACY_POINTER_ID = -1;
export const KEYBOARD_POINTER_ID = -2;

export type DnDPhase = 'idle' | 'armed' | 'dragging' | 'committing' | 'cancelled';
export type DropTargetValidity = 'unknown' | 'valid' | 'invalid';

export interface PointerDescriptor {
  id: number;
  type: string;
  isPrimary: boolean;
  button: number;
}

export interface DropTargetState {
  validity: DropTargetValidity;
  targetId: string | null;
  reason: string | null;
}

export interface DnDSession {
  dragType: string;
  payload: Readonly<DragPayload>;
  pointerId: number;
  pointerType: string;
  origin: Readonly<Point>;
  current: Readonly<Point>;
  grabOffset: Readonly<Point>;
  target: Readonly<DropTargetState>;
}

export interface IdleDnDState {
  phase: 'idle';
  session: null;
  cancelReason: null;
}

export interface ActiveDnDState {
  phase: 'armed' | 'dragging' | 'committing';
  session: Readonly<DnDSession>;
  cancelReason: null;
}

export interface CancelledDnDState {
  phase: 'cancelled';
  session: Readonly<DnDSession>;
  cancelReason: string;
}

export type DnDState = IdleDnDState | ActiveDnDState | CancelledDnDState;

export interface ArmDragRequest {
  dragType: string;
  payload: DragPayload;
  pointer: PointerDescriptor;
  origin: Point;
  grabOffset?: Point;
}

export interface DropTargetUpdate {
  validity: DropTargetValidity;
  targetId?: string | null;
  reason?: string | null;
}

export type DnDAction =
  | { type: 'ARM'; request: ArmDragRequest }
  | { type: 'MOVE'; pointerId: number; position: Point }
  | { type: 'SET_TARGET'; pointerId: number; target: DropTargetUpdate }
  | { type: 'DROP'; pointerId: number; position: Point; target: DropTargetUpdate }
  | { type: 'COMMIT'; pointerId: number }
  | { type: 'CANCEL'; pointerId?: number; reason: string }
  | { type: 'RESET' };

export const initialDnDState: IdleDnDState = Object.freeze({
  phase: 'idle',
  session: null,
  cancelReason: null,
});

const unknownTarget: Readonly<DropTargetState> = Object.freeze({
  validity: 'unknown',
  targetId: null,
  reason: null,
});

function cloneAndFreeze<T>(value: T, seen = new WeakMap<object, object>()): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  const existing = seen.get(value);
  if (existing) {
    return existing as T;
  }

  if (value instanceof Date) {
    return Object.freeze(new Date(value.getTime())) as unknown as T;
  }

  if (Array.isArray(value)) {
    const clone: unknown[] = [];
    seen.set(value, clone);
    value.forEach((entry) => clone.push(cloneAndFreeze(entry, seen)));
    return Object.freeze(clone) as unknown as T;
  }

  const clone: Record<PropertyKey, unknown> = {};
  seen.set(value, clone);
  Reflect.ownKeys(value).forEach((key) => {
    clone[key] = cloneAndFreeze((value as unknown as Record<PropertyKey, unknown>)[key], seen);
  });
  return Object.freeze(clone) as unknown as T;
}

function freezePoint(point: Point): Readonly<Point> {
  return Object.freeze({ x: point.x, y: point.y });
}

function isFinitePoint(point: Point): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

export function canArmPointer(pointer: PointerDescriptor): boolean {
  return pointer.isPrimary && pointer.button === 0 && Number.isFinite(pointer.id);
}

export function hasCrossedDragThreshold(origin: Point, current: Point): boolean {
  const deltaX = current.x - origin.x;
  const deltaY = current.y - origin.y;
  return deltaX * deltaX + deltaY * deltaY >= DRAG_ACTIVATION_DISTANCE_PX * DRAG_ACTIVATION_DISTANCE_PX;
}

function isMatchingPointer(state: Exclude<DnDState, IdleDnDState>, pointerId: number): boolean {
  return state.session.pointerId === pointerId;
}

function moveSession(session: Readonly<DnDSession>, position: Point): Readonly<DnDSession> {
  return Object.freeze({
    ...session,
    current: freezePoint(position),
  });
}

function normalizeTarget(target: DropTargetUpdate): Readonly<DropTargetState> {
  if (target.validity === 'invalid') {
    return Object.freeze({
      validity: 'invalid',
      targetId: target.targetId ?? null,
      reason: target.reason?.trim() || 'invalid-target',
    });
  }

  return Object.freeze({
    validity: target.validity,
    targetId: target.targetId ?? null,
    reason: null,
  });
}

export function dndReducer(state: DnDState, action: DnDAction): DnDState {
  switch (action.type) {
    case 'ARM': {
      if ((state.phase !== 'idle' && state.phase !== 'cancelled') || !canArmPointer(action.request.pointer)) {
        return state;
      }

      if (!action.request.dragType.trim() || !isFinitePoint(action.request.origin) || !isFinitePoint(action.request.grabOffset ?? { x: 0, y: 0 })) {
        return state;
      }

      const origin = freezePoint(action.request.origin);
      return {
        phase: 'armed',
        session: Object.freeze({
          dragType: action.request.dragType,
          payload: cloneAndFreeze(action.request.payload),
          pointerId: action.request.pointer.id,
          pointerType: action.request.pointer.type || 'unknown',
          origin,
          current: origin,
          grabOffset: freezePoint(action.request.grabOffset ?? { x: 0, y: 0 }),
          target: unknownTarget,
        }),
        cancelReason: null,
      };
    }

    case 'MOVE': {
      if ((state.phase !== 'armed' && state.phase !== 'dragging') || !isMatchingPointer(state, action.pointerId) || !isFinitePoint(action.position)) {
        return state;
      }

      const session = moveSession(state.session, action.position);
      return {
        phase: state.phase === 'armed' && hasCrossedDragThreshold(session.origin, session.current) ? 'dragging' : state.phase,
        session,
        cancelReason: null,
      };
    }

    case 'SET_TARGET': {
      if (state.phase !== 'dragging' || !isMatchingPointer(state, action.pointerId)) {
        return state;
      }

      return {
        ...state,
        session: Object.freeze({
          ...state.session,
          target: normalizeTarget(action.target),
        }),
      };
    }

    case 'DROP': {
      if ((state.phase !== 'armed' && state.phase !== 'dragging') || !isMatchingPointer(state, action.pointerId) || !isFinitePoint(action.position)) {
        return state;
      }

      const session = moveSession(state.session, action.position);
      const crossedThreshold = state.phase === 'dragging' || hasCrossedDragThreshold(session.origin, session.current);
      const target = normalizeTarget(action.target);
      const completedSession = Object.freeze({ ...session, target });

      if (!crossedThreshold) {
        return {
          phase: 'cancelled',
          session: completedSession,
          cancelReason: 'movement-threshold-not-reached',
        };
      }

      if (target.validity !== 'valid') {
        return {
          phase: 'cancelled',
          session: completedSession,
          cancelReason: target.reason ?? 'invalid-drop-target',
        };
      }

      return {
        phase: 'committing',
        session: completedSession,
        cancelReason: null,
      };
    }

    case 'COMMIT': {
      if (state.phase !== 'dragging' || !isMatchingPointer(state, action.pointerId) || state.session.target.validity !== 'valid') {
        return state;
      }

      return {
        phase: 'committing',
        session: state.session,
        cancelReason: null,
      };
    }

    case 'CANCEL': {
      if (state.phase === 'idle' || state.phase === 'cancelled') {
        return state;
      }

      if (action.pointerId !== undefined && !isMatchingPointer(state, action.pointerId)) {
        return state;
      }

      return {
        phase: 'cancelled',
        session: state.session,
        cancelReason: action.reason.trim() || 'cancelled',
      };
    }

    case 'RESET':
      return initialDnDState;
  }
}
