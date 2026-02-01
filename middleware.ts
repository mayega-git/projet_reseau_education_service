// middleware.ts
// Centralised Next.js middleware that handles:
//   1. Gateway token lifecycle (init on first visit, proactive refresh)
//   2. Route protection for authenticated areas (/u/*)
//   3. Redirect already-authenticated users away from /auth/* pages

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  initGatewayToken,
  refreshGatewayToken,
  isTokenExpiringSoon,
} from '@/lib/server/token-manager';

// Cookie options shared across all token cookies
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

function setTokenCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  response.cookies.set('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60, // 1 h
  });
  response.cookies.set('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 5, // 5 h
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ---------------------------------------------------------------
  // 1. GATEWAY TOKEN – ensure a valid accessToken cookie exists
  // ---------------------------------------------------------------
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!accessToken) {
    // No token at all – first connection or cookies expired
    if (refreshToken) {
      // Try to refresh first
      const tokens = await refreshGatewayToken(refreshToken);
      if (tokens) {
        setTokenCookies(response, tokens.accessToken, tokens.refreshToken);
      } else {
        // Refresh failed – full init
        const initTokens = await initGatewayToken();
        if (initTokens) {
          setTokenCookies(response, initTokens.accessToken, initTokens.refreshToken);
        }
      }
    } else {
      // No cookies at all – fresh init
      const tokens = await initGatewayToken();
      if (tokens) {
        setTokenCookies(response, tokens.accessToken, tokens.refreshToken);
      }
    }
  } else if (isTokenExpiringSoon(accessToken)) {
    // Token exists but expires within 1 minute – proactive refresh
    if (refreshToken) {
      const tokens = await refreshGatewayToken(refreshToken);
      if (tokens) {
        setTokenCookies(response, tokens.accessToken, tokens.refreshToken);
      }
    }
  }

  // ---------------------------------------------------------------
  // 2. ROUTE PROTECTION – /u/* requires a userToken (logged-in user)
  // ---------------------------------------------------------------
  if (pathname.startsWith('/u')) {
    const userToken = request.cookies.get('userToken')?.value;
    if (!userToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ---------------------------------------------------------------
  // 3. AUTH PAGES – redirect away if already logged in
  // ---------------------------------------------------------------
  if (pathname.startsWith('/auth/')) {
    const userToken = request.cookies.get('userToken')?.value;
    if (userToken) {
      return NextResponse.redirect(new URL('/u/feed/blog', request.url));
    }
  }

  return response;
}

// Only run middleware on pages, not on static assets or API routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
