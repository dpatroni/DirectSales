
import prisma from '@/lib/prisma';
import { getConsultantEarnings } from '@/app/actions/commissions';
import { redirect } from 'next/navigation';
import EarningsDashboard from './EarningsDashboardClient';

export const dynamic = 'force-dynamic';

export default async function EarningsPage() {
    // 1. Get Logged In Consultant
    // For MVP, we hardcode slug or use logic from dashboard/page.tsx
    const SLUG = 'daniel-patroni';
    const consultant = await prisma.consultant.findUnique({ where: { slug: SLUG } });

    if (!consultant) return redirect('/');

    // 2. Get Earnings Data
    const data = await getConsultantEarnings(consultant.id);

    // 3. Render Client Component
    return <EarningsDashboard data={data} />;
}
