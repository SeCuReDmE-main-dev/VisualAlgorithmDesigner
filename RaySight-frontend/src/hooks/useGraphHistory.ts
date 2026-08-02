import { useCallback, useReducer } from 'react';
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react';

export interface GraphSnapshot<NodeType extends Node = Node> {
  nodes: NodeType[];
  edges: Edge[];
}

export interface GraphHistoryState<NodeType extends Node = Node> {
  past: GraphSnapshot<NodeType>[];
  present: GraphSnapshot<NodeType>;
  future: GraphSnapshot<NodeType>[];
  transientBase: GraphSnapshot<NodeType> | null;
}

export type GraphMutation<NodeType extends Node = Node> = (
  current: GraphSnapshot<NodeType>,
) => GraphSnapshot<NodeType>;

type GraphHistoryAction<NodeType extends Node = Node> =
  | { type: 'nodesChanged'; changes: NodeChange<NodeType>[] }
  | { type: 'edgesChanged'; changes: EdgeChange[] }
  | { type: 'commit'; mutation: GraphMutation<NodeType> }
  | { type: 'undo' }
  | { type: 'redo' };

const HISTORY_LIMIT = 100;

function appendPast<NodeType extends Node>(
  past: GraphSnapshot<NodeType>[],
  snapshot: GraphSnapshot<NodeType>,
) {
  return past.concat(snapshot).slice(-HISTORY_LIMIT);
}

function sameSnapshot<NodeType extends Node>(
  left: GraphSnapshot<NodeType>,
  right: GraphSnapshot<NodeType>,
) {
  return left.nodes === right.nodes && left.edges === right.edges;
}

function commitSnapshot<NodeType extends Node>(
  state: GraphHistoryState<NodeType>,
  next: GraphSnapshot<NodeType>,
): GraphHistoryState<NodeType> {
  if (sameSnapshot(state.present, next)) {
    return state;
  }

  const base = state.transientBase ?? state.present;
  return {
    past: appendPast(state.past, base),
    present: next,
    future: [],
    transientBase: null,
  };
}

export function createGraphHistory<NodeType extends Node>(
  initial: GraphSnapshot<NodeType>,
): GraphHistoryState<NodeType> {
  return {
    past: [],
    present: initial,
    future: [],
    transientBase: null,
  };
}

export function graphHistoryReducer<NodeType extends Node>(
  state: GraphHistoryState<NodeType>,
  action: GraphHistoryAction<NodeType>,
): GraphHistoryState<NodeType> {
  if (action.type === 'commit') {
    return commitSnapshot(state, action.mutation(state.present));
  }

  if (action.type === 'undo') {
    const previous = state.past[state.past.length - 1];
    if (!previous) return state;

    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
      transientBase: null,
    };
  }

  if (action.type === 'redo') {
    const next = state.future[0];
    if (!next) return state;

    return {
      past: appendPast(state.past, state.present),
      present: next,
      future: state.future.slice(1),
      transientBase: null,
    };
  }

  if (action.type === 'edgesChanged') {
    const nextEdges = applyEdgeChanges(action.changes, state.present.edges);
    const structural = action.changes.some((change) => change.type !== 'select');
    const next = { ...state.present, edges: nextEdges };
    return structural ? commitSnapshot(state, next) : { ...state, present: next };
  }

  const nextNodes = applyNodeChanges(action.changes, state.present.nodes) as NodeType[];
  const next = { ...state.present, nodes: nextNodes };
  const hasStructuralChange = action.changes.some((change) =>
    change.type === 'add' || change.type === 'remove' || change.type === 'replace',
  );
  const positionChanges = action.changes.filter((change) => change.type === 'position');
  const activelyDragging = positionChanges.some((change) => change.dragging === true);
  const completedDrag = positionChanges.some((change) => change.dragging === false);

  if (hasStructuralChange) {
    return commitSnapshot(state, next);
  }

  if (activelyDragging) {
    return {
      ...state,
      present: next,
      transientBase: state.transientBase ?? state.present,
    };
  }

  if (completedDrag || (positionChanges.length > 0 && !activelyDragging)) {
    return commitSnapshot(state, next);
  }

  return { ...state, present: next };
}

export function useGraphHistory<NodeType extends Node>(initial: GraphSnapshot<NodeType>) {
  const [state, dispatch] = useReducer(graphHistoryReducer<NodeType>, initial, createGraphHistory);

  const onNodesChange = useCallback((changes: NodeChange<NodeType>[]) => {
    dispatch({ type: 'nodesChanged', changes });
  }, []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    dispatch({ type: 'edgesChanged', changes });
  }, []);
  const commit = useCallback((mutation: GraphMutation<NodeType>) => {
    dispatch({ type: 'commit', mutation });
  }, []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  return {
    nodes: state.present.nodes,
    edges: state.present.edges,
    onNodesChange,
    onEdgesChange,
    commit,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
