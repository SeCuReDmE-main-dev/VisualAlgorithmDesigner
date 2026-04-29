import { useMemo, useState } from 'react';
import { Box, Tab, Tabs, Typography, IconButton, Button } from '@mui/material';
import SubpipelineCard from './SubpipelineCard';

const PinIcon = ({ pinned }: { pinned: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 11V7a4 4 0 0 0-8 0v4l-2 3v2h5v6l1 1 1-1v-6h5v-2l-2-3z" />
  </svg>
);
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
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
    return items.filter(item => item.name?.toLowerCase().includes(q) || item.label?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
  }, [items, searchQuery]);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsHovered(false);
        }
      }}
      sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        borderTop: '1px solid var(--color-border)',
        bgcolor: 'var(--color-surface)',
        transition: 'transform 0.3s ease',
        transform: (isPinned || isHovered) ? 'translateY(0)' : 'translateY(calc(100% - 16px))'
      }}>
      <Box sx={{ height: 16, position: 'absolute', top: -16, left: 0, right: 0, cursor: 'pointer' }} />
      <Box sx={{ px: 2, pt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        {isPlayground ? (
          <Typography variant="subtitle2" fontWeight={700} sx={{ py: 1.25 }}>
            🎮 Blocs de départ
          </Typography>
        ) : (
          <Tabs value={tab} onChange={(_, nextTab: number) => setTab(nextTab)} variant="scrollable" allowScrollButtonsMobile>
            {tabLabels.map((label) => (
              <Tab key={label} label={label} sx={{ minHeight: 42, textTransform: 'none', fontWeight: 700 }} />
            ))}
          </Tabs>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <input
            type="text"
            aria-label="Search templates"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)', color: 'var(--color-text)', outline: 'none' }}
          />
          <Button variant="contained" size="small" onClick={onSaveRequested} disabled={!onSaveRequested} sx={{ textTransform: 'none', fontWeight: 700 }}>
            + Save Now
          </Button>
          <IconButton aria-label={isPinned ? "Unpin panel" : "Pin panel"} size="small" onClick={() => setIsPinned(!isPinned)} sx={{ color: isPinned ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            <PinIcon pinned={isPinned} />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateRows: '1fr 1fr', gridAutoFlow: 'column', gap: 1, height: 160, overflowX: 'auto', scrollSnapType: 'x mandatory', px: 2, py: 1.5 }}>
        {filteredItems.map((item) => (
          <SubpipelineCard key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  );
}
