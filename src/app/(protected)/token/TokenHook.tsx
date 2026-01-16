import { useState, useEffect, useRef } from 'react';
import { tokenStore } from '@/app/(protected)/token/tokenStore';


interface TokenResponse {
  token: string;
  expiresIn: number;
}

interface TokenRequest {
  clientName: string;
  clientSecret: string;
  serviceNames: string[];
}

interface UseTokenReturn {
  loading: boolean;
  error: string | null;
  ready: boolean;
  refreshToken: () => Promise<void>;  
}


export function useToken(): UseTokenReturn {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const endpoint = `${apiUrl}/api/auth/token`;
 
  const refreshToken = async (): Promise<void> => {
    try {
      console.log(' Vérification du token existant...');

      // verifier si  token valide existe déjà
      if (tokenStore.has()) {
        const remainingTime = tokenStore.getRemainingTime();
        const remainingMinutes = Math.floor(remainingTime / 60);
        
        console.log(`Token existant valide (expire dans ${remainingMinutes}min)`);
        
        // Token existe et n'est pas expiré
        setReady(true);
        setError(null);
        setLoading(false);
        
        // Planifier le refresh avant expiration
        scheduleTokenRefresh(remainingTime);
        
        return; 
      }else if(tokenStore.isExpired()){

      }

      // pas de token ou expiré 
      console.log(' Pas de token valide, récupération nécessaire...');
      await fetchToken();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur refreshToken:', errorMessage);
      setError(errorMessage);
      setReady(false);
      setLoading(false);
    }
  };


  const fetchToken = async (): Promise<void> => {
    console.log('Appel API pour obtenir un nouveau token...');

    
    const clientName = process.env.NEXT_PUBLIC_CLIENT_NAME;
    const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
    const servicesString = process.env.NEXT_PUBLIC_SERVICE_NAMES;

    //  Validation
    if (!clientName || !clientSecret || !servicesString) {
      throw new Error(
        'Configuration manquante: NEXT_PUBLIC_CLIENT_NAME, ' +
        'NEXT_PUBLIC_CLIENT_SECRET, NEXT_PUBLIC_SERVICE_NAMES'
      );
    }

    // Construire le payload
    const serviceNames = servicesString.split(',').map(s => s.trim());
    const payload: TokenRequest = {
      clientName,
      clientSecret,
      serviceNames
    };

    

    //  Requête POST
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    //  Vérification status
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Erreur HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    //  Parser réponse
    const data: TokenResponse = await response.json();

    //  Stocker le token
    tokenStore.set(data.token, data.expiresIn);

    //  Logger l'expiration
    const expiresAt = new Date(Date.now() + data.expiresIn * 1000);
    console.log('Nouveau token récupéré. Expire à:', expiresAt.toLocaleTimeString());

    //  Planifier le prochain refresh
    scheduleTokenRefresh(data.expiresIn);

    //  Mettre à jour les états
    setReady(true);
    setError(null);
    setLoading(false);
  };

  
  const scheduleTokenRefresh = (expiresIn: number): void => {
    // Annuler le timer précédent
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      console.log('Timer précédent annulé');
    }

    const refreshAt = expiresIn * 0.9 * 1000;
    const minutesUntilRefresh = Math.round(refreshAt / 60000);

    console.log(` Prochain refresh dans ${minutesUntilRefresh} minutes`);

    // Créer le nouveau timer
    refreshTimerRef.current = setTimeout(async () => {
      console.log('Timer déclenché - Renouvellement automatique...');
      
      // Appeler refreshToken (qui va re-fetch)
      await refreshToken();
      
    }, refreshAt);
  };

 
  useEffect(() => {
    // Lancer la vérification/récupération au démarrage
    refreshToken();

    // Cleanup au démontage
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        console.log('Cleanup: Timer nettoyé');
      }
    };
  }, []);

  
  return {
    loading,
    error,
    ready,
    refreshToken  
  };

  const renewToken = async (): Promise<void> => {

    console.log('Appel API pour obtenir un nouveau token...');

    const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;

    if (!clientSecret) {
      throw new Error('Configuration manquante: NEXT_PUBLIC_CLIENT_SECRET');
    }

    const content = {
      token : tokenStore.get()
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content)
    });

    //  Vérification status
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Erreur HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const data: TokenResponse = await response.json();

    tokenStore.set(data.token, data.expiresIn);

    console.log('Nouveau token récupéré via renewToken.');

  };


}