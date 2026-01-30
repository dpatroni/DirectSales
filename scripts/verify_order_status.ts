
import { updateOrderStatus } from '../app/actions/orders';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Verifying Order Status Flow...");

    // 1. Find a recent order (or create one if needed, but lets use recent)
    const order = await prisma.order.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { commissions: true }
    });

    if (!order) throw new Error("No existing order found to test.");
    console.log(`📦 Testing with Order: ${order.id} (Status: ${order.status})`);

    // 2. Test Transition: CONFIRMED
    console.log("➡️ Transitioning to CONFIRMED...");
    await updateOrderStatus(order.id, 'CONFIRMED');

    // Verify Commission Created
    const confirmedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { commissions: true }
    });

    if (confirmedOrder?.status !== 'CONFIRMED') throw new Error("Status failed to update to CONFIRMED");
    if (confirmedOrder.commissions.length === 0) throw new Error("❌ Commission NOT generated on Confirmation");
    console.log(`✅ Commission Generated: ${confirmedOrder.commissions.length} record(s)`);

    // 3. Test Transition: CANCELED (Void Commission)
    console.log("➡️ Transitioning to CANCELED...");
    await updateOrderStatus(order.id, 'CANCELED');

    const canceledOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { commissions: true }
    });

    const invalidCommissions = canceledOrder?.commissions.filter(c => c.status === 'CANCELLED');
    if (invalidCommissions?.length !== canceledOrder?.commissions.length) {
        throw new Error("❌ Commissions were NOT marked as CANCELLED");
    }

    console.log("✅ Verified: Commissions marked as CANCELLED.");

    // Reset to PENDING for cleanup? Or leave as Canceled.
    // Let's leave as canceled to not pollute stats.
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
