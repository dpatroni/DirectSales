
import { PrismaClient } from '@prisma/client';
import { calculateApproveCommission } from '../app/actions/commissions';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Commission Verification...");

    // 1. Setup Test Data
    const brand = await prisma.brand.create({
        data: {
            name: "Test Brand " + Date.now(),
            slug: "test-brand-" + Date.now(),
            defaultCommissionRate: 0.25 // 25%
        }
    });
    console.log(`✅ Created Brand: ${brand.name} (25%)`);

    const product = await prisma.product.create({
        data: {
            name: "Test Perfume",
            sku: "TEST-" + Date.now(),
            brandId: brand.id,
            price: 100.00,
            points: 10
        }
    });

    const cycle = await prisma.cycle.findFirst({ where: { isActive: true } })
        || await prisma.cycle.create({
            data: {
                name: "Test Cycle",
                startDate: new Date(),
                endDate: new Date(),
                isActive: true
            }
        });

    const consultant = await prisma.consultant.findFirst()
        || await prisma.consultant.create({
            data: {
                name: "Test Consultant",
                slug: "test-con-" + Date.now(),
                authId: "test-" + Date.now()
            }
        });

    // 2. Create Order
    const order = await prisma.order.create({
        data: {
            consultantId: consultant.id,
            cycleId: cycle.id,
            status: 'DRAFT',
            subtotal: 200,
            discountTotal: 0,
            total: 200,
            whatsappMessage: "Test Order",
            items: {
                create: [
                    {
                        productId: product.id,
                        quantity: 2,
                        nameSnapshot: product.name,
                        unitPrice: 100.00,
                        finalPrice: 100.00, // No promo
                        pointsSnapshot: 10,
                        isRefillSnapshot: false
                    }
                ]
            }
        }
    });
    console.log(`✅ Created Order: ${order.id}`);

    // 3. Trigger Commission Calculation
    console.log("🔄 Calculating Commission...");
    await calculateApproveCommission(order.id);

    // 4. Verify Result
    const commission = await prisma.commission.findFirst({
        where: { orderId: order.id }
    });

    if (!commission) {
        console.error("❌ Commission NOT found!");
        process.exit(1);
    }

    console.log("✅ Commission Record Found:");
    console.log(commission);

    // Validate calculations
    const expectedGross = 200; // 2 * 100
    const expectedComm = 50;   // 200 * 0.25

    if (Number(commission.grossAmount) === expectedGross && Number(commission.commissionAmount) === expectedComm) {
        console.log("✅ Calculations Correct!");
    } else {
        console.error(`❌ Calculations Wrong. Expected Gross: ${expectedGross}, Got: ${commission.grossAmount}`);
        console.error(`❌ Expected Comm: ${expectedComm}, Got: ${commission.commissionAmount}`);
        process.exit(1);
    }

    // Cleanup
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.commission.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.brand.delete({ where: { id: brand.id } });

    console.log("✅ Cleanup Done.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
