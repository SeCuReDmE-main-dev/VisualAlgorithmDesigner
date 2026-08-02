import { useMemo, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import SubpipelineCard from './SubpipelineCard';
import { LOOP_CATALOG, SECURITY_TEMPLATE_CATALOG, SUBPIPELINE_CATALOG } from '../../services/subpipelineCatalog';
import { PLAYGROUND_CATALOG } from '../../constants/playgroundCatalog';
import type { SessionMode } from '../../hooks/useSessionMode';

interface SubpipelineLibraryPanelProps {
  sessionMode?: SessionMode;
  onSaveRequested?: () => void;
}

export default function SubpipelineLibraryPanel({ sessionMode, onSaveRequested }: SubpipelineLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // In playground mode show the 8 curated entries with friendly labels;
  // no tabs needed — the full catalog would be overwhelming for beginners.
  const isPlayground = sessionMode === 'playground';

  const items = useMemo(() => {
    if (isPlayground) {
      return PLAYGROUND_CATALOG.map((entry) => ({
        id: entry.id,
        label: entry.friendlyLabel,
        description: entry.realWorldExample,
        algorithmId: entry.algorithmId,
        coherenceScore: 0,
        tags: [] as string[],
        category: 'logic' as const,
      }));
    }
    return [...SUBPIPELINE_CATALOG, ...LOOP_CATALOG, ...SECURITY_TEMPLATE_CATALOG];
  }, [isPlayground]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => [item.id, item.label, item.description, ...item.tags].join(' ').toLowerCase().includes(q));
  }, [items, searchQuery]);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: 0,
        flex: '1 1 0',
        flexDirection: 'column',
        gap: 1,
        borderTop: '1px solid var(--color-border)',
        pt: 1.25,
      }}>
      <Box>
        <Typography variant="h6" fontWeight={800}>
          {isPlayground ? 'Starter kits' : 'Ready-made workflows'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
          Add a connected example, then adapt it on the canvas.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <input
            type="text"
            aria-label="Search templates"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-text)', outline: 'none' }}
          />
          <Button variant="outlined" size="small" onClick={onSaveRequested} disabled={!onSaveRequested} sx={{ flex: '0 0 auto', textTransform: 'none', fontWeight: 800 }}>
            Save canvas
          </Button>
      </Box>
      <Box sx={{ display: 'grid', gap: 1, minHeight: 0, overflow: 'auto', pr: 0.5, pb: 1 }}>
        {filteredItems.map((item) => (
          <SubpipelineCard key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  );
}
