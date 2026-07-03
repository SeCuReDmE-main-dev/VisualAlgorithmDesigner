const SESSION_STORAGE_KEY = 'vad_session_id';

function createSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateSessionId() {
  const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);

  if (storedSessionId) {
    return storedSessionId;
  }

  const sessionId = createSessionId();
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function resetSessionId() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  return getOrCreateSessionId();
}
