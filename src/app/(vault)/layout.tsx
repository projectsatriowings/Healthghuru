import React from 'react';
import { VaultProvider } from '@/lib/context/VaultContext';
import { Sidebar } from '@/components/vault/Sidebar';
import { TopBar } from '@/components/vault/TopBar';
import CustomCursor from '@/components/ui/CustomCursor';
import { auth } from '@/lib/auth/auth.config';

export default async function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <VaultProvider 
      initialUserName={session?.user?.name}
      initialUserEmail={session?.user?.email}
    >
      <div className="min-h-screen bg-surface flex">
        <CustomCursor />
        <Sidebar />
        {/* Main area: no left margin on mobile, sidebar width offset on md+ */}
        <div className="flex-1 ml-0 md:ml-[var(--sidebar-width,260px)] flex flex-col min-h-screen w-full min-w-0">
          <TopBar />
          <main className="flex-1 px-3 py-4 md:p-8 pb-[80px] md:pb-8 w-full min-w-0 overflow-x-hidden">
            <div className="site-container-fluid">
              {children}
            </div>
          </main>
        </div>
      </div>
    </VaultProvider>
  );
}
