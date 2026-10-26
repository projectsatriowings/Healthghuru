import { requireAdmin } from '@/lib/auth/session';
import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { AdminSidebarNav } from './AdminSidebarNav';
import { signOut } from '@/lib/auth/auth.config';

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  // Guardrail 2: Server-side re-verification
  await requireAdmin();

  return (
    <div className="h-screen w-full bg-surface flex overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-[var(--sidebar-width,260px)] h-screen bg-surface border-r border-border flex flex-col z-40 shrink-0">
        <div className="p-6 flex flex-col flex-1">
          <Link href="/admin" className="inline-block mb-8 transition-transform hover:scale-105">
            <div className="relative w-12 h-12">
              <Image
                src="/images/logo_transparent.png"
                alt="HealthGhuru Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </Link>
          <AdminSidebarNav />
          <div className="mt-auto">
            <form action={async () => {
              'use server';
              await signOut({ redirectTo: '/admin/login' });
            }}>
              <button type="submit" data-cursor="tab" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-heading font-medium transition-all duration-200 border-l-4 border-transparent text-text-secondary hover:text-red-600 hover:bg-red-50 group">
                <LogOut size={20} className="text-text-secondary group-hover:text-red-600" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Admin Topbar */}
        <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="font-heading font-bold text-2xl text-dark">
              Admin Console
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-heading font-bold cursor-pointer shadow-sm">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
