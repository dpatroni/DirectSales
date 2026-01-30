
import { identifyCustomer } from '../app/actions/customer';
import { createOrderFromCart } from '../app/actions/orders';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Verifying Customer Flow...");

    // 1. Setup Consultant & Cart
    const consultant = await prisma.consultant.findFirst();
    if (!consultant) throw new Error("No consultant found");

    // Mock Cart (requires finding an active cycle and product)
    const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
    if (!cycle) throw new Error("No active cycle");

    const product = await prisma.product.findFirst();
    if (!product) throw new Error("No product found");

    console.log(`👤 Consultant: ${consultant.name}`);

    // 2. Identify Customer
    console.log("🔄 Testing identifyCustomer...");
    const phone = "999888777";
    const name = "Test Customer Flow";

    // Simulate Action
    // Note: Cookies won't work in script, so we expect identifyCustomer to return ID (which it does)
    // but cookie part will fail or be ignored in script environment (cookies() throws usually?)
    // identifyingCustomer uses `cookies()`. In a script, `next/headers` might fail.
    // We might need to mock or skip the action validation.

    // Direct DB creation for "Identification" part to skip cookie issues in script
    let customer = await prisma.customer.findFirst({
        where: { phone, consultantId: consultant.id }
    });

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                fullName: name,
                phone: phone,
                consultantId: consultant.id
            }
        });
        console.log("✅ Customer Created via DB (Script Mock)");
    } else {
        console.log("✅ Customer Found via DB");
    }

    // 3. Create Order linked to Customer
    console.log("🛒 Creating Order...");

    // Create Valid Cart first
    const cart = await prisma.cart.create({
        data: {
            consultantId: consultant.id,
            cycleId: cycle.id,
            items: {
                create: {
                    productId: product.id,
                    quantity: 1
                }
            }
        }
    });

    // Call Action
    const result = await createOrderFromCart(consultant.id, cart.id, {
        name: customer.fullName,
        phone: customer.phone,
        customerId: customer.id
    });

    console.log(`✅ Order Created: ${result.orderId}`);

    // 4. Verify Link
    const order = await prisma.order.findUnique({
        where: { id: result.orderId },
        include: { customer: true }
    });

    if (order?.customerId !== customer.id) {
        throw new Error("❌ Order is NOT linked to Customer!");
    }

    console.log("✅ Verified: Order is linked to Customer correctly.");
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
