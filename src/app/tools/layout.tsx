import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth.config';
import { sql } from '@/lib/db';
import { PremiumPaywall } from '@/components/community/PremiumPaywall';

export default async function ToolsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login?callbackUrl=/tools');
  }

  const userId = session.user.id;
  const planRes = await sql`SELECT tier FROM user_plans WHERE user_id = ${userId}`;
  
  const isPremium = planRes.length > 0 && planRes[0].tier === 'pro';

  if (!isPremium) {
    return <PremiumPaywall />;
  }

  return (
    <div className="bg-background min-h-screen">
      {children}
    </div>
  );
}
