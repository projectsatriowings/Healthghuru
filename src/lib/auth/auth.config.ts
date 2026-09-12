import NextAuth, { DefaultSession, CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

class SuspendedAccountError extends CredentialsSignin {
  code = "suspended";
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || "7f3e8f9d6c4a2b1e5a9d8f3c7e6b5a4d3c2b1e0f9d8c7b6a5d4e3f2a1b0c9d8",
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const cleanEmail = (credentials.email as string).trim().toLowerCase();
        
        const users = await sql`
          SELECT id, name, email, password_hash, role, status
          FROM users 
          WHERE LOWER(email) = ${cleanEmail}
        `;
        
        const user = users[0];
        if (!user) return null;
        if (user.status === 'suspended') {
          throw new SuspendedAccountError();
        }
        
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string, 
          user.password_hash
        );
        
        if (passwordsMatch) {
          // Asynchronously record last login
          try {
            await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}::uuid`;
          } catch {
            // Non-blocking
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          };
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
});
