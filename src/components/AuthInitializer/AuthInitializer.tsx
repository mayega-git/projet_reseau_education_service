// src/components/AuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { setupFetchInterceptor } from '@/lib/auth/fetch-interceptor';

console.log('🟢 [AuthInitializer] Module loaded');

export default function AuthInitializer() {
  console.log('🟡 [AuthInitializer] Component rendering');

  useEffect(() => {
    console.log('🔵 [AuthInitializer] useEffect triggered!');
    console.log('🏗️ [AuthInitializer] Setting up fetch interceptor...');
    
    try {
      setupFetchInterceptor();
      console.log('✅ [AuthInitializer] Setup complete');
    } catch (error) {
      console.error('❌ [AuthInitializer] Error:', error);
    }
  }, []);

  // Ne rend rien visuellement (plus de bandeau rouge)
  return null;
}