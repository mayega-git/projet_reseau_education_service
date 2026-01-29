/* eslint-disable @typescript-eslint/no-unused-vars */
 //'use client'; 

import type { Metadata } from 'next';
import { useEffect } from 'react';
import { Geist, Geist_Mono, Poppins, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { GlobalStateProvider } from '@/context/GlobalStateContext';
import { Toaster } from 'sonner';
import HeaderWrapper from '@/components/Header/HeaderWrapper';
import AuthInitializer from '@/components/AuthInitializer/AuthInitializer';



const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Optional: Use a CSS custom property for better integration
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'LetsGo Blog And Podcast',
  description: 'LetsGo Blog And Podcast',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  
  return (
    
          <html lang="en">
            <body
              className={`${inter.variable} ${poppins.variable} antialiased`}
            >
              <AuthInitializer />
              <AuthProvider>
                <GlobalStateProvider>
                  <main>{children}</main>
                  <Toaster />
                </GlobalStateProvider>
              </AuthProvider>
            </body>
          </html>
      
  );
}
