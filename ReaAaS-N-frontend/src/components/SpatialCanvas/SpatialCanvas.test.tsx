import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import SpatialCanvas from './SpatialCanvas';

// Mock ResizeObserver which is required by ReactFlow and undefined in jsdom
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('SpatialCanvas', () => {
  it('renders the SpatialCanvas component without crashing', () => {
    const { getByTestId } = render(<SpatialCanvas />);
    const container = getByTestId('spatial-canvas');
    expect(container).toBeInTheDocument();
  });

  it('initializes with given nodes and edges', () => {
    const nodes = [{ id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } }];
    const edges = [{ id: 'e1-2', source: '1', target: '2' }];

    // We cannot deeply inspect react-flow internals easily, but we can ensure it mounts with props
    const { getByTestId } = render(
      <SpatialCanvas initialNodes={nodes} initialEdges={edges} />
    );

    expect(getByTestId('spatial-canvas')).toBeInTheDocument();
  });
});
