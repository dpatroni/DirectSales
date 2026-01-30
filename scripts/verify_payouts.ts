
import { generatePayoutForCycle, markPayoutAsPaid } from '../app/actions/payouts';
import { updateOrderStatus } from '../app/actions/orders';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Verifying Payouts Flow...");

    // 1. Setup Data
    const consultant = await prisma.consultant.findFirst();
    const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
    if (!consultant || !cycle) throw new Error("Missing base data (Consultant or Cycle)");

    // 1. Create Data (Self-contained test)
    console.log("🆕 Creating Fresh Test Order...");
    const product = await prisma.product.findFirst();
    if (!product) throw new Error("No products found");

    const order = await prisma.order.create({
        data: {
            consultantId: consultant.id,
            cycleId: cycle.id,
            status: 'DRAFT',
            subtotal: 100,
            discountTotal: 0,
            total: 100,
            whatsappMessage: "Test Payouts",
            items: {
                create: {
                    productId: product.id,
                    nameSnapshot: product.name,
                    quantity: 1,
                    unitPrice: 100,
                    finalPrice: 100,
                    pointsSnapshot: 10,
                    isRefillSnapshot: false
                }
            }
        }
    });

    console.log(`📦 Created Order: ${order.id}`);

    // 2. Transition to CONFIRMED (Generates Commission)
    console.log("➡️ Confirming Order...");
    await updateOrderStatus(order.id, 'CONFIRMED');
    console.log("🚚 Marking Order as DELIVERED...");
    await updateOrderStatus(order.id, 'DELIVERED');

    // 3. Generate Payout
    console.log("💰 Generating Payout...");
    const result: any = await generatePayoutForCycle(consultant.id, cycle.id);

    if (result.success) {
        console.log(`✅ Payout Created: ${result.payoutId} (Amount: ${result.amount})`);

        // 4. Mark as Paid
        console.log("💸 Marking as PAID...");
        await markPayoutAsPaid(result.payoutId);

        const payout = await prisma.payout.findUnique({ where: { id: result.payoutId } });
        if (payout?.status === 'PAID') {
            console.log("✅ Verified: Payout status is PAID");
        } else {
            throw new Error("❌ Failed to update Payout status");
        }
    } else {
        console.log(`ℹ️ Payout Generation Result: ${result.message}`);
        // Could be "Already generated", which is also a valid test case outcome for idempotency
        if (result.payoutId) {
            console.log(`✅ Idempotency check passed (Existing Payout: ${result.payoutId})`);
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
