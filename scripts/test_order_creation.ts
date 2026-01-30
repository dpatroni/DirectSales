import { createOrderFromCart } from "../app/actions/orders";
import prisma from "../lib/prisma";

async function main() {
    const SLUG = 'daniel-patroni';

    // 1. Get Consultant
    const consultant = await prisma.consultant.findUnique({ where: { slug: SLUG } });
    if (!consultant) throw new Error("Consultant not found");

    // 2. Get Active Cycle
    const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
    if (!activeCycle) throw new Error("No active cycle");

    // 3. Create or Get Cart
    // Let's create a fresh cart and add items
    const cart = await prisma.cart.create({
        data: {
            consultantId: consultant.id,
            cycleId: activeCycle.id
        }
    });

    // 4. Add Items (1 regular, 1 promo if possible)
    const product = await prisma.product.findFirst();
    if (!product) throw new Error("No products");

    await prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId: product.id,
            quantity: 2
        }
    });

    console.log("Cart created:", cart.id);

    // 5. Test Order Creation
    const result = await createOrderFromCart(consultant.id, cart.id, { name: "Test Client", phone: "999888777" });

    if (result.success) {
        console.log("Order created successfully:", result.orderId);
        console.log("WA Message Preview:\n", result.whatsappMessage);

        // Verify DB persistence
        const storedOrder = await prisma.order.findUnique({
            where: { id: result.orderId },
            include: { items: true }
        });
        console.log("DB Order Total:", storedOrder?.total);
        console.log("DB Order Items:", storedOrder?.items.length);
    } else {
        console.error("Order creation failed");
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
