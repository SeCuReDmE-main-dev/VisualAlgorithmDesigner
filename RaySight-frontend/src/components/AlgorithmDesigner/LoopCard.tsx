import type { DetectedLoop } from '../../hooks/useLoopDetector';

export interface LoopCardProps {
  loop: DetectedLoop;
  onFocusNode?: (nodeId: string) => void;
}

export function LoopCard({ loop, onFocusNode }: LoopCardProps) {
  return (
    <article style={cardStyle}>
      <h3 style={titleStyle}>Loop detected</h3>
      <p style={copyStyle}>{loop.nodeIds.length} nodes form a directed cycle.</p>
      <div style={nodeListStyle}>
        {loop.nodeIds.map((nodeId) => (
          <button key={nodeId} type="button" onClick={() => onFocusNode?.(nodeId)} style={nodeButtonStyle}>
            {nodeId}
          </button>
        ))}
      </div>
    </article>
  );
}

const cardStyle: React.CSSProperties = { display: 'grid', gap: 10, padding: 12, border: '1px solid #fed7aa', borderRadius: 8, background: '#fff7ed' };
const titleStyle: React.CSSProperties = { margin: 0, color: '#9a3412', fontSize: 15 };
const copyStyle: React.CSSProperties = { margin: 0, color: '#7c2d12' };
const nodeListStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 6 };
const nodeButtonStyle: React.CSSProperties = { border: '1px solid #fdba74', borderRadius: 999, background: '#fff', color: '#9a3412', padding: '4px 8px' };
