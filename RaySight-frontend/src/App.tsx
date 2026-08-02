import { useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router';
import AlgorithmDesignerPage from './pages/AlgorithmDesignerPage';
import AlgorithmBuilderPage from './pages/AlgorithmBuilderPage';
import CircuitDesignerPage from './pages/CircuitDesignerPage';
import NotFoundPage from './pages/NotFoundPage';
import { DnDProvider } from './contexts/DnDContext';
import { useSessionMode } from './hooks/useSessionMode';
import { ModeSelectionDialog } from './components/ModeSelectionDialog';
import { FEATURE_FLAGS } from './config/featureFlags';

const HEALTH_POLL_MS = 30_000;
const HEALTH_TIMEOUT_MS = 3_000;

function useBackendHealth(enabled: boolean) {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    if (!enabled) {
      setBackendOnline(null);
      return undefined;
    }

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
  }, [enabled]);

  return backendOnline;
}

function App() {
  const backendOnline = useBackendHealth(FEATURE_FLAGS.annexes);
  const { config, switchToPlayground, switchToWorkbench } = useSessionMode();
  const [modeSelected, setModeSelected] = useState(() => {
    try {
      return localStorage.getItem('vad_session_mode') !== null;
    } catch {
      return true; // Assume selected if storage is inaccessible
    }
  });

  return (
    <DnDProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <ModeSelectionDialog
          open={!modeSelected}
          onPlayground={switchToPlayground}
          onWorkbench={() => switchToWorkbench(config?.mode === 'workbench' ? config.securityProfile : 'general')}
          onSelect={() => setModeSelected(true)}
        />
        {FEATURE_FLAGS.annexes && backendOnline === false && (
          <Alert severity="warning" sx={{ borderRadius: 0 }}>
            Backend unavailable. AI explanation and evaluation are offline until the server is running.
          </Alert>
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/designer" replace />} />
          <Route path="/designer" element={<AlgorithmDesignerPage backendOnline={backendOnline} />} />
          <Route path="/builder" element={<AlgorithmBuilderPage />} />
          <Route path="/circuit" element={<CircuitDesignerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
    </DnDProvider>
  );
}

export default App;
