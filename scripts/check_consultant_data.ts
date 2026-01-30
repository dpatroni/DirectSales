
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const consultants = await prisma.consultant.findMany({
        include: {
            activatedProducts: {
                include: { product: true }
            }
        }
    });

    console.log('Consultants found:', consultants.length);
    consultants.forEach(c => {
        console.log(`- ${c.name} (${c.slug}): ${c.activatedProducts.length} products`);
        c.activatedProducts.forEach(cp => {
            console.log(`  * ${cp.product.name} (Visible: ${cp.isVisible})`);
        });
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
