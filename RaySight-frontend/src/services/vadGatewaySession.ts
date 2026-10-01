import { requireVadSession, type VadGatewaySession } from './webMcpTools';

const configured = import.meta.env.VITE_SECUREDME_GATEWAY_URL || 'https://gateway-dev.securedme.ca';
export async function loadVadGatewaySession(): Promise<VadGatewaySession> {
  const origin = new URL(configured);
  const approved = origin.protocol === 'https:' && origin.hostname === 'gateway-dev.securedme.ca'
    || origin.protocol === 'http:' && ['127.0.0.1', '[::1]'].includes(origin.hostname);
  if (!approved || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== '/') throw new Error('GATEWAY_ENDPOINT_NOT_ALLOWED');
  const response = await fetch(`${origin.origin}/api/v1/session`, {
    credentials: 'include', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(response.status === 401 ? 'GATEWAY_SESSION_REQUIRED' : 'GATEWAY_SESSION_UNAVAILABLE');
  const session: unknown = await response.json();
  requireVadSession(session);
  return session;
}
