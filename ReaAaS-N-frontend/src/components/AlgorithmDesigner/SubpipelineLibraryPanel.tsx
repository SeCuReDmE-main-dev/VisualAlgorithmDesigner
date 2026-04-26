import { useMemo, useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import SubpipelineCard from './SubpipelineCard';
import { LOOP_CATALOG, MECHANISM_CATALOG, SECURITY_TEMPLATE_CATALOG, SUBPIPELINE_CATALOG } from '../../services/subpipelineCatalog';

const tabLabels = ['Templates', 'Mechanisms', 'Loops', 'Security', 'Validated'] as const;

export default function SubpipelineLibraryPanel() {
  const [tab, setTab] = useState(0);
  const items = useMemo(() => {
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
  }, [tab]);

  return (
    <Box sx={{ borderTop: '1px solid var(--color-border)', bgcolor: 'var(--color-surface)', minHeight: 190 }}>
      <Box sx={{ px: 2, pt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Tabs value={tab} onChange={(_, nextTab: number) => setTab(nextTab)} variant="scrollable" allowScrollButtonsMobile>
          {tabLabels.map((label) => (
            <Tab key={label} label={label} sx={{ minHeight: 42, textTransform: 'none', fontWeight: 700 }} />
          ))}
        </Tabs>
        <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
          Drag to expand on canvas
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', scrollSnapType: 'x mandatory', px: 2, py: 1.5 }}>
        {items.map((item) => (
          <SubpipelineCard key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  );
}
