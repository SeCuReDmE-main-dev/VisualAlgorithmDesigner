import { useEffect, useState } from 'react';
import { Alert, Box, Container, Typography } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import AlgorithmDesignerPage from './pages/AlgorithmDesignerPage';
import AlgorithmBuilderPage from './pages/AlgorithmBuilderPage';
import CircuitDesignerPage from './pages/CircuitDesignerPage';
import NotFoundPage from './pages/NotFoundPage';
import { DnDProvider } from './contexts/DnDContext';

const HEALTH_POLL_MS = 30_000;
const HEALTH_TIMEOUT_MS = 3_000;

function useBackendHealth() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const checkHealth = async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

      try {
        const response = await fetch('/api/health', { signal: controller.signal });
        if (active) {
          setBackendOnline(response.ok);
        }
      } catch {
        if (active) {
          setBackendOnline(false);
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };

    void checkHealth();
    const interval = window.setInterval(() => void checkHealth(), HEALTH_POLL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return backendOnline;
}

function App() {
  const backendOnline = useBackendHealth();

  return (
    <DnDProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {backendOnline === false && (
          <Alert severity="warning" sx={{ borderRadius: 0 }}>
            Backend unavailable. AI explanation and evaluation are offline until the server is running.
          </Alert>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/designer" replace />} />
          <Route path="/designer" element={<AlgorithmDesignerPage />} />
          <Route path="/builder" element={<AlgorithmBuilderPage />} />
          <Route path="/circuit" element={<CircuitDesignerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
    </DnDProvider>
  );
}

export default App;
