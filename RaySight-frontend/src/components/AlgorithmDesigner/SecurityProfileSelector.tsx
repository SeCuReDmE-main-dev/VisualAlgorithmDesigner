import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import {
  DEFAULT_SECURITY_PROFILE_ID,
  getSecurityProfile,
  SECURITY_PROFILE_CATALOG,
  SecurityProfileId,
} from '../../services/securityProfileCatalog';

interface SecurityProfileSelectorProps {
  value?: SecurityProfileId;
  onChange: (profileId: SecurityProfileId) => void;
  disabled?: boolean;
}

export function SecurityProfileSelector({
  value = DEFAULT_SECURITY_PROFILE_ID,
  onChange,
  disabled = false,
}: SecurityProfileSelectorProps) {
  const [pendingProfile, setPendingProfile] = useState<SecurityProfileId | null>(null);
  const selectedProfile = useMemo(() => getSecurityProfile(value), [value]);

  const handleChange = (event: SelectChangeEvent<SecurityProfileId>) => {
    const nextProfile = getSecurityProfile(event.target.value);
    if (nextProfile.requiresDisclaimer) {
      setPendingProfile(nextProfile.id);
      return;
    }
    onChange(nextProfile.id);
  };

  const disclaimerProfile = pendingProfile ? getSecurityProfile(pendingProfile) : null;

  return (
    <Box>
      <FormControl size="small" fullWidth disabled={disabled}>
        <InputLabel id="security-profile-label">Security profile</InputLabel>
        <Select
          labelId="security-profile-label"
          value={selectedProfile.id}
          label="Security profile"
          onChange={handleChange}
        >
          {SECURITY_PROFILE_CATALOG.map((profile) => (
            <MenuItem key={profile.id} value={profile.id}>
              {profile.shortLabel}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
        Threshold {selectedProfile.promotionThreshold} - {selectedProfile.legalJustification}
      </Typography>

      <Dialog open={Boolean(disclaimerProfile)} onClose={() => setPendingProfile(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{disclaimerProfile?.label} disclaimer</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              This profile is for authorized defensive, compliance, or red-team activity only.
            </Alert>
            <Typography variant="body2">
              Confirm that the pipeline has documented authorization, a legitimate purpose, and will not be used for
              malware generation, unauthorized access, credential theft, or private data extraction without consent.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Blocked intents: {disclaimerProfile?.blockedIntents.join(', ')}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingProfile(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (pendingProfile) {
                onChange(pendingProfile);
              }
              setPendingProfile(null);
            }}
          >
            I confirm authorization
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SecurityProfileSelector;
