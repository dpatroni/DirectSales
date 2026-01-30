import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const SLUG = 'daniel-patroni';

    // 1. Get Consultant & Brand context (not strictly needed for promo creation but good for logs)
    const consultant = await prisma.consultant.findUnique({ where: { slug: SLUG } });
    console.log('Consultant:', consultant?.name);

    // 2. Get Active Cycle
    const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });
    if (!activeCycle) throw new Error("No active cycle found");
    console.log('Active Cycle:', activeCycle.name);

    // 3. Get a Product (e.g., Kaiak or something visible)
    const product = await prisma.product.findFirst({
        where: { name: { contains: 'Kaiak' } }
    });
    if (!product) throw new Error("Product not found");
    console.log('Product selected:', product.name);

    // 4. Create Promotion
    const promo = await prisma.promotion.create({
        data: {
            name: 'Promo Flash Script',
            description: 'Created via script for testing',
            discountType: 'PERCENTAGE',
            discountValue: 20, // 20% OFF
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 week
            cycleId: activeCycle.id,
            isActive: true,
            products: {
                create: {
                    productId: product.id
                }
            }
        }
    });

    console.log('Promotion created successfully:', promo.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
