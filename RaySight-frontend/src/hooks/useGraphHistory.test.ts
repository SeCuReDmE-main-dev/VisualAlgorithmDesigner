import type { Edge, Node, NodeChange } from '@xyflow/react';
import { createGraphHistory, graphHistoryReducer } from './useGraphHistory';

type TestNode = Node<{ label: string }>;

const node = (id: string, x = 0): TestNode => ({
  id,
  position: { x, y: 0 },
  data: { label: id },
});

describe('graphHistoryReducer', () => {
  it('undoes an atomic multi-node and edge transaction in one action', () => {
    let state = createGraphHistory<TestNode>({ nodes: [], edges: [] });
    state = graphHistoryReducer(state, {
      type: 'commit',
      mutation: () => ({
        nodes: [node('a'), node('b')],
        edges: [{ id: 'a-b', source: 'a', target: 'b' }],
      }),
    });

    expect(state.present.nodes).toHaveLength(2);
    expect(state.past).toHaveLength(1);
    state = graphHistoryReducer(state, { type: 'undo' });
    expect(state.present).toEqual({ nodes: [], edges: [] });
    expect(state.future).toHaveLength(1);
  });

  it('coalesces a complete pointer move into one undo entry', () => {
    let state = createGraphHistory<TestNode>({ nodes: [node('a')], edges: [] });
    const moving = (x: number, dragging: boolean): NodeChange<TestNode>[] => [{
      id: 'a',
      type: 'position',
      position: { x, y: 0 },
      dragging,
    }];

    state = graphHistoryReducer(state, { type: 'nodesChanged', changes: moving(20, true) });
    state = graphHistoryReducer(state, { type: 'nodesChanged', changes: moving(40, true) });
    state = graphHistoryReducer(state, { type: 'nodesChanged', changes: moving(60, false) });

    expect(state.past).toHaveLength(1);
    expect(state.present.nodes[0].position.x).toBe(60);
    state = graphHistoryReducer(state, { type: 'undo' });
    expect(state.present.nodes[0].position.x).toBe(0);
  });

  it('does not add selection-only changes to history', () => {
    let state = createGraphHistory<TestNode>({ nodes: [node('a')], edges: [] });
    state = graphHistoryReducer(state, {
      type: 'nodesChanged',
      changes: [{ id: 'a', type: 'select', selected: true }],
    });
    expect(state.past).toHaveLength(0);
    expect(state.present.nodes[0].selected).toBe(true);
  });

  it('clears redo after a new committed edit', () => {
    let state = createGraphHistory<TestNode>({ nodes: [node('a')], edges: [] });
    state = graphHistoryReducer(state, {
      type: 'commit',
      mutation: (current) => ({ ...current, nodes: current.nodes.concat(node('b')) }),
    });
    state = graphHistoryReducer(state, { type: 'undo' });
    expect(state.future).toHaveLength(1);
    state = graphHistoryReducer(state, {
      type: 'commit',
      mutation: (current) => ({ ...current, nodes: current.nodes.concat(node('c')) }),
    });
    expect(state.future).toHaveLength(0);
  });

  it('tracks edge deletion as a reversible edit', () => {
    const edges: Edge[] = [{ id: 'a-b', source: 'a', target: 'b' }];
    let state = createGraphHistory<TestNode>({ nodes: [node('a'), node('b')], edges });
    state = graphHistoryReducer(state, {
      type: 'edgesChanged',
      changes: [{ id: 'a-b', type: 'remove' }],
    });
    expect(state.present.edges).toHaveLength(0);
    state = graphHistoryReducer(state, { type: 'undo' });
    expect(state.present.edges).toEqual(edges);
  });
});
