// src/lib/server/token-manager.ts
// Server-only gateway token lifecycle: init & refresh.
// These functions talk to the backend API Gateway and return raw tokens.
// Cookie persistence is handled by the caller (middleware or Server Action).

import { ServiceURLs } from './services';

const API_KEY = process.env.API_KEY ?? '';
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID ?? '';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * First-connection flow: obtains an initial gateway token pair.
 * Uses X-API-KEY-GATEWAY + X-API-KEY-GATEWAY-CLIENT headers.
 */
export async function initGatewayToken(): Promise<TokenPair | null> {
  try {
    const res = await fetch(
      `${ServiceURLs.gateway}/apikeygateway/generateFirstConnection/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY-GATEWAY': API_KEY,
          'X-API-KEY-GATEWAY-CLIENT': CLIENT_ID,
        },
        body: JSON.stringify({}),
      },
    );

    if (!res.ok) {
      console.error('[token-manager] init failed:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    const accessToken: string = data.access_token ?? data.accessToken ?? '';
    const refreshToken: string = data.refresh_token ?? data.refreshToken ?? '';

    if (!accessToken || !refreshToken) {
      console.error('[token-manager] init: missing tokens in response');
      return null;
    }

    return { accessToken, refreshToken };
  } catch (err) {
    console.error('[token-manager] init exception:', err);
    return null;
  }
}

/**
 * Refresh flow: exchanges a refresh token for a new token pair.
 */
export async function refreshGatewayToken(
  currentRefreshToken: string,
): Promise<TokenPair | null> {
  try {
    const res = await fetch(
      `${ServiceURLs.gateway}/education-service/apikeygateway/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      },
    );

    if (!res.ok) {
      console.error('[token-manager] refresh failed:', res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    const accessToken: string = data.accessToken ?? data.access_token ?? '';
    const refreshToken: string = data.refreshToken ?? data.refresh_token ?? '';

    if (!accessToken) {
      console.error('[token-manager] refresh: missing accessToken');
      return null;
    }

    return { accessToken, refreshToken: refreshToken || currentRefreshToken };
  } catch (err) {
    console.error('[token-manager] refresh exception:', err);
    return null;
  }
}

/**
 * Decode a JWT payload without verification (for reading `exp`).
 * Returns null on any parsing error.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Returns true when the token expires within `marginMs` milliseconds.
 */
export function isTokenExpiringSoon(token: string, marginMs = 60_000): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true; // treat as expired
  return payload.exp * 1000 < Date.now() + marginMs;
}
