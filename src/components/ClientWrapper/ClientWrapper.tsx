'use client';  

import dynamic from 'next/dynamic';

const AuthInitializer = dynamic(
  () => import('@/components/AuthInitializer/AuthInitializer'),
  { ssr: false } // charger uniquement côté client
);

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthInitializer />   {/* setup fetch interceptor */}
      {children}
    </>
  );
}
