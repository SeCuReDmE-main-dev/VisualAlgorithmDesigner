export interface StatusBarProps {
  nodeCount: number;
  edgeCount: number;
  latencyMs?: number | null;
  hasLoop?: boolean;
  coherenceScore?: number | null;
}

export function StatusBar({ nodeCount, edgeCount, latencyMs, hasLoop = false, coherenceScore }: StatusBarProps) {
  return (
    <footer style={barStyle} aria-label="Pipeline status">
      <span>{nodeCount} nodes</span>
      <span>{edgeCount} edges</span>
      <span>{latencyMs == null ? 'Latency -' : `${latencyMs} ms`}</span>
      <span style={hasLoop ? warningStyle : okStyle}>{hasLoop ? 'Loop detected' : 'No loops'}</span>
      <span>{coherenceScore == null ? 'Not evaluated' : `${coherenceScore}% coherence`}</span>
    </footer>
  );
}

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  minHeight: 36,
  padding: '0 12px',
  borderTop: '1px solid #dbe3ec',
  background: '#f8fafc',
  color: '#334155',
  fontSize: 13,
};

const okStyle: React.CSSProperties = { color: '#166534', fontWeight: 700 };
const warningStyle: React.CSSProperties = { color: '#b45309', fontWeight: 700 };
