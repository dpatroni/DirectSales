
import { getConsultantDashboardData } from '../app/actions/dashboard';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Verifying Dashboard Data Aggregation...");

    const data = await getConsultantDashboardData();

    if (!data) throw new Error("Dashboard data returned null (Consultant not found?)");

    console.log("👤 Consultant:", data.consultant.name);
    console.log("🔄 Cycle:", data.cycle.name, `(${data.cycle.daysRemaining} days left)`);

    console.log("📊 KPIs:");
    console.log(`   - Sales: S/ ${data.kpis.sales}`);
    console.log(`   - Earnings: S/ ${data.kpis.earnings}`);
    console.log(`   - Active Orders: ${data.kpis.activeOrders}`);
    console.log(`   - Total Clients: ${data.kpis.totalClients}`);

    console.log("📦 Recent Orders:");
    data.recentOrders.forEach(o => {
        console.log(`   - [${o.status}] ${o.clientName}: S/ ${o.total}`);
    });

    console.log("💰 Payout Actions:");
    console.log(`   - Pending Payout Request? ${data.payoutAction.hasPending}`);
    console.log(`   - Can Request New? ${data.payoutAction.canRequest}`);

    // Basic Validation
    if (Number(data.kpis.sales) >= 0 && Number(data.kpis.earnings) >= 0) {
        console.log("✅ Data Sanity Check: OK");
    } else {
        throw new Error("Data Sanity Check Failed (Negative values?)");
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
