import type { ValidatedAlgorithmRecord } from '../../services/validatedAlgorithmCatalog';

export interface ValidatedAlgorithmCardProps {
  algorithm: ValidatedAlgorithmRecord;
  onLoad?: (algorithm: ValidatedAlgorithmRecord) => void;
  onDelete?: (id: string) => void;
}

export function ValidatedAlgorithmCard({ algorithm, onLoad, onDelete }: ValidatedAlgorithmCardProps) {
  return (
    <article style={cardStyle}>
      <header style={headerStyle}>
        <div>
          <h3 style={titleStyle}>{algorithm.name}</h3>
          <p style={metaStyle}>{new Date(algorithm.promotedAt).toLocaleString()}</p>
        </div>
        <strong style={scoreStyle}>{algorithm.coherenceScore}%</strong>
      </header>

      {algorithm.description && <p style={descriptionStyle}>{algorithm.description}</p>}

      <dl style={statsStyle}>
        <div>
          <dt>Nodes</dt>
          <dd>{algorithm.nodes.length}</dd>
        </div>
        <div>
          <dt>Edges</dt>
          <dd>{algorithm.edges.length}</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{algorithm.evaluation.recommendation}</dd>
        </div>
      </dl>

      <footer style={actionsStyle}>
        {onLoad && (
          <button type="button" onClick={() => onLoad(algorithm)} style={buttonStyle}>
            Load
          </button>
        )}
        {onDelete && (
          <button type="button" aria-label={`Delete algorithm ${algorithm.name}`} onClick={() => onDelete(algorithm.id)} style={dangerButtonStyle}>
            Delete
          </button>
        )}
      </footer>
    </article>
  );
}

const cardStyle: React.CSSProperties = { display: 'grid', gap: 12, padding: 14, border: '1px solid #dbe3ec', borderRadius: 8, background: '#fff' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12 };
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 16 };
const metaStyle: React.CSSProperties = { margin: '4px 0 0', color: '#64748b', fontSize: 12 };
const scoreStyle: React.CSSProperties = { color: '#166534', fontSize: 18 };
const descriptionStyle: React.CSSProperties = { margin: 0, color: '#334155' };
const statsStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: 0 };
const actionsStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: 8 };
const buttonStyle: React.CSSProperties = { border: '1px solid #cad3df', borderRadius: 6, background: '#fff', padding: '8px 10px' };
const dangerButtonStyle: React.CSSProperties = { ...buttonStyle, color: '#b91c1c' };
