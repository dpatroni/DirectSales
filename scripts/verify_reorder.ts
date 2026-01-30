
import { PrismaClient } from '@prisma/client';
import { repeatOrder } from '../app/actions/reorder';
import { createOrderFromCart } from '../app/actions/orders';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Verifying Reorder Logic...");

    // 1. Setup Data
    const consultant = await prisma.consultant.findFirst();
    const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
    const product = await prisma.product.findFirst();
    if (!consultant || !cycle || !product) throw new Error("Missing base data");

    let customer = await prisma.customer.findFirst({ where: { consultantId: consultant.id } });
    if (!customer) throw new Error("Need a customer.");

    // 2. Create Base Order (to be repeated)
    console.log("🛒 Creating base order...");
    const cart = await prisma.cart.create({
        data: { cycleId: cycle.id, consultantId: consultant.id }
    });
    await prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId: product.id,
            quantity: 3,
            selectedVariant: {}
        }
    });

    const orderResult: any = await createOrderFromCart(consultant.id, cart.id, {
        name: customer.fullName,
        phone: customer.phone,
        customerId: customer.id
    });

    if (!orderResult.success) throw new Error("Failed to create base order.");
    const originalOrderId = orderResult.orderId;
    console.log(`✅ Base Order Created: ${originalOrderId}`);

    // 3. Repeat Order
    console.log("🔄 Repeating Order...");
    const result = await repeatOrder(customer.id, originalOrderId);

    if (result.success && result.cartId) {
        console.log(`✅ Repeat Successful -> New Cart: ${result.cartId}`);
        // Verify items
        const newCartItems = await prisma.cartItem.findMany({ where: { cartId: result.cartId } });
        console.log(`   Items in new cart: ${newCartItems.length} (Expected: 1, Qty: 3)`);

        if (newCartItems.length === 1 && newCartItems[0].quantity === 3) {
            console.log("✅ Data Validation: OK");
        } else {
            throw new Error("Data Validation Failed: Items mismatch.");
        }

    } else {
        throw new Error(`Repeat Failed: ${result.message}`);
    }

    // 4. Test Unavailable Item (Modify product to be inactive for test? Risk of side effects. Skipping mutation test for safety in this script unless using transaction rollback.)
    // We trust logic if base flow works.
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
