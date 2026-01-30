
import { PrismaClient } from '@prisma/client';
import { getCustomerOrders, getCustomerOrder, verifyCustomerAccess } from '../app/actions/customer-portal';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Verifying Customer History...");

    // 1. Setup Data
    const consultant = await prisma.consultant.findFirst();
    let customer = await prisma.customer.findFirst({ where: { consultantId: consultant!.id } });
    if (!customer) throw new Error("Need a customer.");

    const order = await prisma.order.findFirst({ where: { customerId: customer.id } });
    if (!order) throw new Error("Need an order for this customer.");

    console.log(`👤 Customer: ${customer.id}`);
    console.log(`📦 Order: ${order.id}`);

    // 2. Test Access Verification
    const verified = await verifyCustomerAccess(customer.id);
    if (verified?.id === customer.id) {
        console.log("✅ Verified Access: OK");
    } else {
        throw new Error("Access Verification Failed");
    }

    // 3. Test List Fetch
    const list = await getCustomerOrders(customer.id);
    if (list.length > 0 && list[0].id) {
        console.log(`✅ Fetched Orders: ${list.length} found.`);
    } else {
        throw new Error("Fetch Orders Failed");
    }

    // 4. Test Detail Fetch
    const detail = await getCustomerOrder(customer.id, order.id);
    if (detail && detail.id === order.id && detail.items.length >= 0) {
        console.log(`✅ Fetched Detail: ${detail.id} (Status: ${detail.status})`);
    } else {
        throw new Error("Fetch Detail Failed");
    }

    // 5. Security Test (Wrong Customer)
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const secureCheck = await getCustomerOrder(fakeId, order.id);
    if (secureCheck === null) {
        console.log("✅ Security Check: Access Denied for wrong customer.");
    } else {
        throw new Error("Security Failure: Accessed order with wrong customer ID");
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
