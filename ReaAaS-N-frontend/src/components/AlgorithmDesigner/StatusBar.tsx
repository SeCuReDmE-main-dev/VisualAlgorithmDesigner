export interface StatusBarProps {
  nodeCount: number;
  edgeCount: number;
  latencyMs?: number | null;
  hasLoop?: boolean;
  coherenceScore?: number | null;
}

export function StatusBar({ nodeCount, edgeCount, latencyMs, hasLoop = false, coherenceScore }: StatusBarProps) {
  return (
    <footer className="sbar-root" aria-label="Pipeline status">
      <span>{nodeCount} nodes</span>
      <span>{edgeCount} edges</span>
      <span>{latencyMs == null ? 'Latency -' : `${latencyMs} ms`}</span>
      <span className={hasLoop ? 'sbar-warning' : 'sbar-ok'}>{hasLoop ? 'Loop detected' : 'No loops'}</span>
      <span>{coherenceScore == null ? 'Not evaluated' : `${coherenceScore}% coherence`}</span>
    </footer>
  );
}
