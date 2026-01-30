
import { getConsultantDashboardData } from '@/app/actions/dashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

import { KPIGrid as KPIGridComponent } from '@/components/dashboard/KPIGrid';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const data = await getConsultantDashboardData();

    if (!data) {
        redirect('/'); // Or login
    }

    return (
        <div className="min-h-screen bg-[#FDFCFD] pb-24 font-sans">
            <DashboardHeader
                name={data.consultant.name}
                level={data.consultant.level}
                avatarUrl={data.consultant.avatarUrl || ''}
            />

            <main className="px-4 -mt-4 relative z-10">

                {/* 1. KPIs */}
                <KPIGridComponent
                    sales={data.kpis.sales}
                    earnings={data.kpis.earnings}
                    activeOrders={data.kpis.activeOrders}
                    totalClients={data.kpis.totalClients}
                    newClients={data.kpis.newClients}
                />

                {/* 2. Quick Actions */}
                <QuickActions pendingPayout={data.payoutAction.canRequest} />

                {/* 3. Cycle Info (Mini Banner) */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 text-white flex justify-between items-center mb-6 shadow-md">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Ciclo Actual</p>
                        <h3 className="font-bold">{data.cycle.name}</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold">{data.cycle.daysRemaining}</span>
                        <span className="text-xs text-gray-400 block">días restantes</span>
                    </div>
                </div>

                {/* 4. Recent Activity */}
                <RecentActivity orders={data.recentOrders} />

            </main>
        </div>
    );
}
