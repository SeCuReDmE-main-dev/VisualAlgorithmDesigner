import { Box, Chip, Stack, Typography } from '@mui/material';
import { useDnD } from '../../contexts/DnDContext';
import type { LoopTemplate, MechanismTemplate, SubpipelineTemplate } from '../../services/subpipelineCatalog';

type CardItem = SubpipelineTemplate | MechanismTemplate | LoopTemplate;

function isSubpipelineTemplate(item: CardItem): item is SubpipelineTemplate {
  return 'loopCompatible' in item;
}

function isMechanismTemplate(item: CardItem): item is MechanismTemplate {
  return 'algorithmId' in item;
}

interface SubpipelineCardProps {
  item: CardItem;
}

export default function SubpipelineCard({ item }: SubpipelineCardProps) {
  const { setDrag, clearDrag } = useDnD();
  const isMechanism = isMechanismTemplate(item);
  const nodes = isMechanism
    ? undefined
    : item.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      }));
  const edges = isMechanism ? undefined : item.edges;

  return (
    <Box
      draggable
      className="vad-subpipeline-card"
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('application/reactflow', item.id);
        setDrag(isMechanism ? 'mechanism' : 'subpipeline', {
          algorithmId: isMechanism ? item.algorithmId : item.id,
          label: item.label,
          category: item.category,
          isPrefab: !isMechanism,
          prefabNodes: nodes,
          prefabEdges: edges,
          coherenceScore: item.coherenceScore,
          loopCapable: isSubpipelineTemplate(item) ? item.loopCompatible : true,
        });
      }}
      onDragEnd={clearDrag}
      sx={{
        minWidth: 260,
        p: 1.25,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        bgcolor: 'var(--color-surface-alt)',
        cursor: 'grab',
        scrollSnapAlign: 'start',
        transition: 'transform 140ms ease, border-color 140ms ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          borderColor: 'var(--color-accent)',
        },
      }}
    >
      <Stack spacing={0.75}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {item.label}
          </Typography>
          <Chip size="small" color={item.coherenceScore >= 93 ? 'success' : 'default'} label={`${item.coherenceScore}%`} sx={{ height: 22, fontSize: '0.68rem' }} />
        </Box>
        <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', minHeight: 34 }}>
          {item.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {item.tags.slice(0, 3).map((tag) => (
            <Chip key={tag} size="small" variant="outlined" label={tag} sx={{ height: 20, fontSize: '0.65rem' }} />
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
