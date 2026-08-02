import { useMemo } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useDragSource } from '../../hooks/useDragSource';
import type { LoopTemplate, MechanismTemplate, SubpipelineTemplate } from '../../services/subpipelineCatalog';
import { FEATURE_FLAGS } from '../../config/featureFlags';

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
  const dragPayload = useMemo(() => ({
    algorithmId: isMechanism ? item.algorithmId : item.id,
    label: item.label,
    category: item.category,
    isPrefab: !isMechanism,
    prefabNodes: nodes,
    prefabEdges: edges,
    coherenceScore: item.coherenceScore,
    loopCapable: isSubpipelineTemplate(item) ? item.loopCompatible : true,
  }), [edges, isMechanism, item, nodes]);
  const { dragHandleProps, placeAtCenter, ownsKeyboardSession } = useDragSource({
    type: isMechanism ? 'mechanism' : 'subpipeline',
    payload: dragPayload,
  });

  return (
    <Box
      className="vad-subpipeline-card"
      data-testid={`palette-card-${item.id}`}
      tabIndex={0}
      onKeyDown={dragHandleProps.onKeyDown}
      sx={{
        minWidth: 0,
        width: '100%',
        p: 1.25,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        bgcolor: 'var(--color-surface-alt)',
        userSelect: 'none',
        borderWidth: ownsKeyboardSession ? 2 : 1,
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
          {FEATURE_FLAGS.promotion && <Chip size="small" color={item.coherenceScore >= 93 ? 'success' : 'default'} label={`${item.coherenceScore}%`} sx={{ height: 22, fontSize: '0.68rem' }} />}
        </Box>
        <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', minHeight: { xs: 0, sm: 34 } }}>
          {item.description}
        </Typography>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5, flexWrap: 'wrap' }}>
          {item.tags.slice(0, 3).map((tag) => (
            <Chip key={tag} size="small" variant="outlined" label={tag} sx={{ height: 20, fontSize: '0.65rem' }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box
            component="button"
            type="button"
            {...dragHandleProps}
            data-testid={`palette-drag-handle-${item.id}`}
            aria-label={`Drag ${item.label}. Press Enter or Space for keyboard placement.`}
            sx={{
              width: 44,
              height: 44,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              bgcolor: 'var(--color-surface)',
              color: 'var(--color-accent)',
              cursor: 'grab',
              touchAction: 'none',
              fontWeight: 900,
              '&:focus-visible': { outline: '3px solid var(--color-accent)', outlineOffset: 2 },
            }}
          >
            ⋮⋮
          </Box>
          <Button size="small" variant="outlined" aria-label={`Add ${item.label} to canvas`} onClick={() => placeAtCenter()}>
            Place at center
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
