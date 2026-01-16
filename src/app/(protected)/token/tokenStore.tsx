

export interface TokenData {
  token: string;
  expiresAt: Date | null;
  issuedAt: Date;
}

export interface TokenStoreInterface {
  set(token: string, expiresIn?: number): void;
  get(): string | null;
  has(): boolean;
  isExpired(): boolean;
  getExpiresAt(): Date | null;
  clear(): void;
  getRemainingTime(): number;
}





class TokenStore implements TokenStoreInterface {
 
  
  private token: string | null = null;
  private expiresAt: Date | null = null;
  private issuedAt: Date | null = null;

  
  set(token: string, expiresIn?: number): void {
    // Validation basique
    if (!token || token.trim() === '') {
      console.error('❌ Tentative de stockage d\'un token vide');
      return;
    }

    this.token = token;
    this.issuedAt = new Date();

    if (expiresIn && expiresIn > 0) {
      this.expiresAt = new Date(Date.now() + expiresIn * 1000);
      
      console.log('Token stocké:', {
        preview: token.substring(0, 20) + '...',
        expiresAt: this.expiresAt.toLocaleTimeString(),
        expiresIn: `${expiresIn}s (${Math.round(expiresIn / 60)}min)`
      });
    } else {
      this.expiresAt = null;
      console.log('Token stocké (sans expiration):', token.substring(0, 20) + '...');
    }
  }

  
  get(): string | null {
    if (!this.token) {
      console.warn(' Aucun token disponible');
      return null;
    }

    if (this.isExpired()) {
      console.warn('⚠️ Token expiré');
      return null;
    }

    return this.token;
  }

  /**
   * Verifier si un token valide existe
   */
 
  has(): boolean {
    return this.token !== null && !this.isExpired();
  }

  
  isExpired(): boolean {
    // Si pas de date d'expiration définie, token jamais expiré
    if (!this.expiresAt) {
      return false;
    }

    // Comparer avec l'heure actuelle
    const now = new Date();
    const expired = now > this.expiresAt;

    if (expired) {
      console.warn('Token expiré depuis:', 
        Math.round((now.getTime() - this.expiresAt.getTime()) / 1000), 
        'secondes'
      );
    }

    return expired;
  }

 
  getExpiresAt(): Date | null {
    return this.expiresAt;
  }

  
  getRemainingTime(): number {
    if (!this.expiresAt) {
      return -1; // Pas d'expiration définie
    }

    const now = new Date();
    const remaining = Math.max(0, this.expiresAt.getTime() - now.getTime());
    
    return Math.floor(remaining / 1000); // Conversion en secondes
  }

  /**
   * Effacer le token 
   */
  clear(): void {
    const hadToken = this.token !== null;
    
    this.token = null;
    this.expiresAt = null;
    this.issuedAt = null;

    if (hadToken) {
      console.log(' Token effacé');
    }
  }

  /**
   * Debug - Afficher l'état actuel du store
   */
  debug(): void {
    console.log('🔍 État du TokenStore:', {
      hasToken: this.token !== null,
      tokenPreview: this.token ? this.token.substring(0, 30) + '...' : null,
      issuedAt: this.issuedAt?.toLocaleString(),
      expiresAt: this.expiresAt?.toLocaleString(),
      isExpired: this.isExpired(),
      remainingSeconds: this.getRemainingTime()
    });
  }
}



export const tokenStore = new TokenStore();

// Empecher la création d'autres instances
Object.freeze(tokenStore);

