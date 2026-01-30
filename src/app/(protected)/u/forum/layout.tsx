'use client';

import { AppSidebar } from '@/app/sidebar';
import {
    SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
//import SideBarHeader from '@/components/Header/SideBarHeader';
import { useAuth } from '@/context/AuthContext';

export default function ForumLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { token } = useAuth();

  if (!token) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        
        <main className="w-full px-6 mt-4 mb-16">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}