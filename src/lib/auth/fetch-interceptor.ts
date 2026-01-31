// src/lib/auth/fetch-interceptor.ts
'use client';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let initPromise: Promise<string | null> | null = null;

// Notifie toutes les requêtes en attente après refresh
function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Ajoute une requête à la queue
function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Récupère l'access token depuis l'API /token
async function getAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/token', { method: 'GET', credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      return data.accessToken || null;
    }
    return null;
  } catch (err) {
    console.error('❌ Failed to get access token', err);
    return null;
  }
}

// Refresh token via /refresh
async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.accessToken || null;
  } catch (err) {
    console.error('❌ Token refresh failed', err);
    return null;
  }
}

// Initialise le token au démarrage
async function initializeAuth(): Promise<string | null> {
  try {
    // Vérifie si un token existe déjà
    let token = await getAccessToken();
    if (token) return token;

    // Sinon, appelle /init pour obtenir le token initial
    const res = await fetch('/api/auth/init', { method: 'POST', credentials: 'include' });
    if (!res.ok) return null;

    // Après init, récupère à nouveau le token depuis /token
    token = await getAccessToken();
    return token;
  } catch (err) {
    console.error('❌ Auth initialization failed', err);
    return null;
  }
}

// Setup global fetch interceptor
export function setupFetchInterceptor() {
  const originalFetch = window.fetch;

  // Lancer init au démarrage et stocker la promesse
  initPromise = initializeAuth();

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Skip des routes d'auth
    if (url.startsWith('/api/auth/')) return originalFetch(input, init);

    // Attendre le token prêt
    let token = await initPromise;
    if (!token) token = await getAccessToken(); // fallback

    const headers = new Headers(init?.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);

    console.log('📤 [Fetch Interceptor] Request about to be sent:');
    console.log('URL:', url);
    console.log('Method:', init?.method || 'GET');
    console.log('Headers:');
    headers.forEach((value, key) => console.log(`  ${key}: ${value}`));
    if (init?.body) console.log('Body:', init.body);

    let response = await originalFetch(input, { ...init, headers });

    // Retry si TOKEN_EXPIRED
    if (response.status === 401) {
      const errorData = await response.clone().json().catch(() => ({}));
      if (errorData.error === 'TOKEN_EXPIRED') {
        if (!isRefreshing) {
          isRefreshing = true;
          const newToken = await refreshAccessToken();
          isRefreshing = false;

          if (newToken) {
            onRefreshed(newToken);
            headers.set('Authorization', `Bearer ${newToken}`);
            response = await originalFetch(input, { ...init, headers });
          } else {
            refreshSubscribers = [];
          }
        } else {
          // Si refresh déjà en cours, attendre le nouveau token
          token = await new Promise<string>((resolve) => addRefreshSubscriber(resolve));
          headers.set('Authorization', `Bearer ${token}`);
          response = await originalFetch(input, { ...init, headers });
        }
      }
    }

    return response;
  };
}
