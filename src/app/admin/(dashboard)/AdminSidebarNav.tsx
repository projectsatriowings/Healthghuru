'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  CreditCard,
  Rss,
  Activity,
  CheckSquare,
  Layers,
} from 'lucide-react';
import { IconAction } from '@/components/ui/IconAction';

export function AdminSidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/content', label: 'Content Library', icon: FileText },
    { href: '/admin/review-queue', label: 'Review Queue', icon: CheckSquare },
    { href: '/admin/sources', label: 'Content Sources', icon: Rss },
    { href: '/admin/ingestion', label: 'Ingestion Runs', icon: Activity },
    { href: '/admin/categories', label: 'Taxonomy', icon: Layers },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  ];

  return (
    <>
      <nav className="space-y-1 mt-4 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              data-cursor="tab"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-heading font-medium text-sm transition-all duration-200 border-l-4 ${
                isActive 
                  ? "bg-primary/10 text-primary border-primary font-semibold" 
                  : "text-text-secondary hover:text-dark hover:bg-surface border-transparent"
              }`}
            >
              <IconAction context="nav">
                <Icon size={18} className={isActive ? "text-primary" : "text-text-secondary"} />
              </IconAction>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <Link 
          href="/admin/settings" 
          data-cursor="tab"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-heading font-medium text-sm transition-all duration-200 border-l-4 ${
            pathname.startsWith('/admin/settings')
              ? "bg-primary/10 text-primary border-primary font-semibold"
              : "text-text-secondary hover:text-dark hover:bg-surface border-transparent"
          }`}
        >
          <IconAction context="nav">
            <Settings size={18} className={pathname.startsWith('/admin/settings') ? "text-primary" : "text-text-secondary"} />
          </IconAction>
          Settings
        </Link>
      </div>
    </>
  );
}
