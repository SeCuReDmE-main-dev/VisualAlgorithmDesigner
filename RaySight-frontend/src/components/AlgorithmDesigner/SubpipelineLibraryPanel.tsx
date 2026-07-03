import { useMemo, useState } from 'react';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import SubpipelineCard from './SubpipelineCard';
import { LOOP_CATALOG, MECHANISM_CATALOG, SECURITY_TEMPLATE_CATALOG, SUBPIPELINE_CATALOG } from '../../services/subpipelineCatalog';
import { PLAYGROUND_CATALOG } from '../../constants/playgroundCatalog';
import type { SessionMode } from '../../hooks/useSessionMode';

interface SubpipelineLibraryPanelProps {
  sessionMode?: SessionMode;
  onSaveRequested?: () => void;
}

const tabLabels = ['Templates', 'Mechanisms', 'Loops', 'Security', 'Validated'] as const;

export default function SubpipelineLibraryPanel({ sessionMode, onSaveRequested }: SubpipelineLibraryPanelProps) {
  const [tab, setTab] = useState(0);
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
        nodes: [],
        edges: [],
        coherenceScore: 0,
        tags: [] as string[],
        loopCompatible: false,
        category: 'classic' as const,
      }));
    }
    if (tab === 0) {
      return SUBPIPELINE_CATALOG;
    }
    if (tab === 1) {
      return MECHANISM_CATALOG;
    }
    if (tab === 2) {
      return LOOP_CATALOG;
    }
    if (tab === 3) {
      return SECURITY_TEMPLATE_CATALOG;
    }
    return SUBPIPELINE_CATALOG.filter((template) => template.coherenceScore >= 93);
  }, [isPlayground, tab]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        {isPlayground ? (
          <Typography variant="subtitle2" fontWeight={800}>
            Starter kits
          </Typography>
        ) : (
          <Tabs value={tab} onChange={(_, nextTab: number) => setTab(nextTab)} variant="scrollable" allowScrollButtonsMobile sx={{ minHeight: 36 }}>
            {tabLabels.map((label) => (
              <Tab key={label} label={label} sx={{ minHeight: 36, px: 1, textTransform: 'none', fontSize: 12, fontWeight: 800 }} />
            ))}
          </Tabs>
        )}
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
            Save
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
