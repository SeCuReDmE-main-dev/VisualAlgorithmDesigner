import { Box, Typography } from '@mui/material';
import vadLogo from '../../assets/brand/vad-powered-by-h2o-logo-light.jpg';
import raysightBadge from '../../assets/brand/raysight-badge-light.jpg';
import onboardingBanner from '../../assets/brand/vad-powered-by-h2o-onboarding-light.jpg';

export function VADBrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Box
        component="img"
        src={vadLogo}
        alt="Visual Algorithm Designer - Powered by H2O"
        sx={{
          width: compact ? 42 : 150,
          height: compact ? 42 : 44,
          objectFit: compact ? 'cover' : 'contain',
          objectPosition: compact ? 'left center' : 'center',
          borderRadius: compact ? 4 : 0,
          flex: '0 0 auto',
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 900, lineHeight: 1.05 }}>
          {compact ? 'VAD' : 'Visual Algorithm Designer'}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-text-muted)', fontWeight: 700 }}>
          {compact ? 'Algorithm Designer' : 'VAD · Powered by H2O · RaySight guide'}
        </Typography>
      </Box>
    </Box>
  );
}

export function RaySightGuideBadge() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        component="img"
        src={raysightBadge}
        alt="RaySight guide badge"
        sx={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
      />
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1 }}>
          RaySight
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--color-text-muted)' }}>
          Learning guide
        </Typography>
      </Box>
    </Box>
  );
}

export function VADOnboardingBanner() {
  return (
    <Box
      component="img"
      src={onboardingBanner}
      alt="Visual Algorithm Designer - Powered by H2O onboarding banner"
      sx={{
        width: 'min(520px, 88vw)',
        maxHeight: 150,
        objectFit: 'cover',
        objectPosition: 'center',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-panel)',
      }}
    />
  );
}
