import 'server-only';
import { auth } from './auth.config';
import { redirect } from 'next/navigation';
import { sql } from '@/lib/db';

export async function getSession() {
  return await auth();
}

/**
 * The actual security boundary. Call this at the top of every admin
 * Server Component, Server Action, and Route Handler.
 */
export async function requireAdmin() {
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
}
