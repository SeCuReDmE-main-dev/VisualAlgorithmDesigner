import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

export default function AlgorithmEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <g data-testid="algorithm-edge" data-edge-id={id}>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
    </g>
  );
}
