export interface LoopEdgeBadgeProps {
  count: number;
}

export function LoopEdgeBadge({ count }: LoopEdgeBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span aria-label={`${count} loop edge${count === 1 ? '' : 's'}`} style={badgeStyle}>
      Loop x{count}
    </span>
  );
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 22,
  padding: '2px 8px',
  borderRadius: 999,
  background: '#ffedd5',
  color: '#9a3412',
  fontSize: 12,
  fontWeight: 700,
};
