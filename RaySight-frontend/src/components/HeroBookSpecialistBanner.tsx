import { Box, Chip, Typography } from '@mui/material';

/** A specialist identity banner, not a second Hero Book state store. */
export function HeroBookSpecialistBanner() {
  return <Box role="status" aria-label="Hero Book specialist context" sx={{ bgcolor: '#101221', color: '#e1e1f6', borderBottom: '2px solid #00d2ff', px: 2, py: 1.25, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', fontFamily: 'Inter, sans-serif' }}>
    <Typography variant="body2" fontWeight={800}>Hero Book · Visual Algorithm Designer</Typography>
    <Chip label="Spatial visualisation coach" size="small" sx={{ bgcolor: '#a5e7ff', color: '#003543', fontWeight: 800 }} />
    <Typography variant="caption">AlgoQuest owns mission, evidence, tokens and progression. VAD returns proposals or receipts through Qbit.</Typography>
  </Box>;
}
