import 'server-only';
import { cache } from 'react';
import { auth } from './auth.config';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';

export const getSession = cache(async () => {
  return await auth();
});

/**
 * The actual security boundary. Memoized via React cache() so multiple
 * calls within the same request (e.g., layout + page) only execute the
 * database verification query ONCE.
 */
export const requireAdmin = cache(async () => {
  const session = await getSession();
  if (!session?.user) {
    redirect('/admin/login');
  }
  
  // Real DB check to ensure immediate revocation works even with JWT
  const users = await sql`SELECT role FROM users WHERE id = ${session.user.id}::uuid`;
  const user = users[0];
  
  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }
  
  // Attach the freshest role to the session object
  session.user.role = user.role;
  return session;
});
