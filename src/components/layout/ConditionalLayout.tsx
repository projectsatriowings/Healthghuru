"use client";

import { usePathname } from "next/navigation";

export default function ConditionalLayout({
  children,
  navbar,
  footer,
}: {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide site navbar/footer only within the Admin console
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && navbar}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdmin && footer}
    </>
  );
}
