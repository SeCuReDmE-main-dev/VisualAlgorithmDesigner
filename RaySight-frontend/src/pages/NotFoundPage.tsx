import { Button, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h4" component="h1">
          Page not found
        </Typography>
        <Typography color="text.secondary">
          The requested route does not exist.
        </Typography>
        <Button component={RouterLink} to="/designer" variant="contained">
          Return to Designer
        </Button>
      </Stack>
    </Container>
  );
}

export default NotFoundPage;
