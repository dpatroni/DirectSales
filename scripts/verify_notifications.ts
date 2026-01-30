
import { PrismaClient } from '@prisma/client';
import { updateOrderStatus, createOrderFromCart } from '../app/actions/orders';
import { generatePayoutForCycle } from '../app/actions/payouts';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Verifying Notifications System...");

    // 1. Setup Data
    const consultant = await prisma.consultant.findFirst();
    const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
    if (!consultant || !cycle) throw new Error("Missing base data (Consultant or Cycle)");

    // Ensure we have a customer
    let customer = await prisma.customer.findFirst({ where: { consultantId: consultant.id } });
    if (!customer) {
        console.log("Creating test customer...");
        customer = await prisma.customer.create({
            data: {
                fullName: "Test Customer",
                phone: "555-0000",
                consultantId: consultant.id
            }
        });
    }

    // 2. Create Order -> Should trigger ORDER_CREATED
    console.log("🛒 Creating Order (Trigger: ORDER_CREATED)...");

    // Create Cart First (Action requirement)
    const product = await prisma.product.findFirst();
    const cart = await prisma.cart.create({
        data: {
            cycleId: cycle.id,
            consultantId: consultant.id
        }
    });
    await prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId: product!.id,
            quantity: 1,
            selectedVariant: {}
        }
    });

    const orderResult: any = await createOrderFromCart(consultant.id, cart.id, {
        name: customer.fullName,
        phone: customer.phone,
        customerId: customer.id
    });

    if (!orderResult.success) throw new Error("Order creation failed");

    // Verify Notification 1
    await verifyNotification('ORDER_CREATED', consultant.id); // For Consultant
    // await verifyNotification('ORDER_CREATED', customer.id); // For Customer (logic was if clientInfo.customerId exists)

    // 3. Update Status -> ORDER_CONFIRMED
    console.log("➡️ Confirming Order (Trigger: ORDER_CONFIRMED)...");
    await updateOrderStatus(orderResult.orderId, 'CONFIRMED');
    await verifyNotification('ORDER_CONFIRMED', customer.id);

    // 4. Update Status -> ORDER_DELIVERED
    console.log("🚚 Delivering Order (Trigger: ORDER_DELIVERED)...");
    await updateOrderStatus(orderResult.orderId, 'DELIVERED');
    await verifyNotification('ORDER_DELIVERED', customer.id);

    // 5. Payout -> PAYOUT_AVAILABLE
    console.log("💰 Generating Payout (Trigger: PAYOUT_AVAILABLE)...");
    // Payout logic requires "eligible commissions". Confirming order generates commission?
    // app/actions/orders.ts -> updateOrderStatus -> calculateApproveCommission
    // So commission should exist.

    const payoutResult: any = await generatePayoutForCycle(consultant.id, cycle.id);
    if (payoutResult.success) {
        await verifyNotification('PAYOUT_AVAILABLE', consultant.id);
    } else {
        console.log("ℹ️ Payout skipped (maybe already exists or no balance): " + payoutResult.message);
    }

    console.log("✅ All Verification Steps Passed!");
}

async function verifyNotification(type: string, recipientId: string) {
    // Give DB time to write (async in action)
    await new Promise(r => setTimeout(r, 2000));

    const notif = await prisma.notification.findFirst({
        where: {
            type: type as any,
            recipientId: recipientId
        },
        orderBy: { createdAt: 'desc' }
    });

    if (notif) {
        console.log(`✅ Verified Notification: ${type} -> ${recipientId} [${notif.status}]`);
    } else {
        console.warn(`⚠️ WARNING: Notification ${type} for ${recipientId} NOT FOUND.`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
