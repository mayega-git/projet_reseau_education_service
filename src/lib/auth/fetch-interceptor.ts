// src/lib/auth/fetch-interceptor.ts
'use client';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  console.log('🔄 [Fetch Interceptor] Notifying subscribers with new token');
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  console.log('⏳ [Fetch Interceptor] Adding request to refresh queue');
  refreshSubscribers.push(callback);
}

// Fonction pour obtenir l'access token depuis les cookies
async function getAccessToken(): Promise<string | null> {
  console.log('🔑 [Fetch Interceptor] Getting access token from cookies...');
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      console.log(' [Fetch Interceptor] Access token retrieved:', data.accessToken ? '✓ Present' : '✗ Missing');
      return data.accessToken;
    }
    console.warn(' [Fetch Interceptor] No access token found in cookies');
    return null;
  } catch (error) {
    console.error('❌ [Fetch Interceptor] Failed to get access token:', error);
    return null;
  }
}

// Fonction pour refresh le token
async function refreshAccessToken(): Promise<string | null> {
  console.log('🔄 [Fetch Interceptor] Refreshing access token...');
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      console.log(' [Fetch Interceptor] Token refreshed successfully');
      return data.accessToken;
    }
    console.error('❌ [Fetch Interceptor] Token refresh failed:', response.status);
    return null;
  } catch (error) {
    console.error('❌ [Fetch Interceptor] Token refresh error:', error);
    return null;
  }
}

// Initialisation automatique au chargement
async function initializeAuth() {
  console.log('🚀 [Fetch Interceptor] ===== AUTH INITIALIZATION START =====');
  try {
    // Vérifier si un token existe
    const token = await getAccessToken();
    
    if (!token) {
      console.log('📝 [Fetch Interceptor] No token found, requesting new one...');
      const response = await fetch('/api/auth/init', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('✅ [Fetch Interceptor] Initial token obtained successfully');
      } else {
        const errorText = await response.text().catch(() => '');
        console.error(
          '❌ [Fetch Interceptor] Failed to obtain initial token:',
          response.status,
          errorText
        );
      }
    } else {
      console.log('✅ [Fetch Interceptor] Existing token found, skipping init');
    }
  } catch (error) {
    console.error('❌ [Fetch Interceptor] Auth initialization failed:', error);
  }
  console.log('🏁 [Fetch Interceptor] ===== AUTH INITIALIZATION END =====');
}

// Surcharger fetch global
export function setupFetchInterceptor() {
  console.log('⚙️ [Fetch Interceptor] Setting up global fetch interceptor...');
  
  // Sauvegarder la fonction fetch originale
  const originalFetch = window.fetch;

  // Initialiser l'auth au démarrage
  initializeAuth();

  // Remplacer fetch par notre version
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Ne pas intercepter les appels aux routes d'auth Next.js
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    if (url.startsWith('/api/auth/')) {
      console.log(`🔓 [Fetch Interceptor] Skipping auth routes: ${url}`);
      return originalFetch(input, init);
    }

    console.log(`🌐 [Fetch Interceptor] Intercepting request: ${url}`);

    // Obtenir l'access token
    let token = await getAccessToken();

    // Ajouter le header Authorization
    const headers = new Headers(init?.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log(`🔐 [Fetch Interceptor] Added Authorization header to request`);
    } else {
      console.warn(`⚠️ [Fetch Interceptor] No token available, request sent WITHOUT Authorization header`);
    }

    // Faire la requête avec le token
    console.log(`📤 [Fetch Interceptor] Sending request to: ${url}`);
    let response = await originalFetch(input, {
      ...init,
      headers,
    });

    console.log(`📥 [Fetch Interceptor] Response received: ${response.status} ${response.statusText}`);

    // Si 401 TOKEN_EXPIRED → refresh et retry
    if (response.status === 401) {
      console.warn('⚠️ [Fetch Interceptor] 401 Unauthorized detected, checking if TOKEN_EXPIRED...');
      
      const errorData = await response.clone().json().catch(() => ({}));
      console.log('📋 [Fetch Interceptor] Error data:', errorData);
      
      if (errorData.error === 'TOKEN_EXPIRED') {
        console.log('🔄 [Fetch Interceptor] TOKEN_EXPIRED confirmed, starting refresh flow...');
        
        if (!isRefreshing) {
          isRefreshing = true;
          console.log('🔄 [Fetch Interceptor] This request will handle the refresh');
          
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            isRefreshing = false;
            onRefreshed(newToken);
            
            console.log('🔁 [Fetch Interceptor] Retrying original request with new token');
            // Retry la requête avec le nouveau token
            headers.set('Authorization', `Bearer ${newToken}`);
            response = await originalFetch(input, {
              ...init,
              headers,
            });
            console.log(`✅ [Fetch Interceptor] Retry successful: ${response.status}`);
          } else {
            isRefreshing = false;
            refreshSubscribers = [];
            console.error('❌ [Fetch Interceptor] Token refresh failed completely');
          }
        } else {
          console.log('⏳ [Fetch Interceptor] Refresh already in progress, waiting...');
          // Si refresh en cours, attendre
          token = await new Promise<string>((resolve) => {
            addRefreshSubscriber((newToken: string) => {
              resolve(newToken);
            });
          });
          
          console.log('🔁 [Fetch Interceptor] Retrying request after refresh completed');
          headers.set('Authorization', `Bearer ${token}`);
          response = await originalFetch(input, {
            ...init,
            headers,
          });
          console.log(`✅ [Fetch Interceptor] Queued request completed: ${response.status}`);
        }
      } else {
        console.log('ℹ️ [Fetch Interceptor] 401 but not TOKEN_EXPIRED, passing through');
      }
    }

    return response;
  };

  console.log('✅ [Fetch Interceptor] Global fetch interceptor setup complete');
}
