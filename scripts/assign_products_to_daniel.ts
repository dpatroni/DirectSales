
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const SLUG = 'daniel-patroni';

    console.log(`🔍 Buscando consultor: ${SLUG}...`);
    const consultant = await prisma.consultant.findUnique({
        where: { slug: SLUG }
    });

    if (!consultant) {
        console.error(`❌ Consultor ${SLUG} no encontrado.`);
        // List all consultants to help debug
        const all = await prisma.consultant.findMany();
        console.log('Consultores disponibles:', all.map(c => c.slug).join(', '));
        return;
    }

    console.log(`✅ Consultor encontrado: ${consultant.name}`);

    // Fetch all products
    const products = await prisma.product.findMany();
    console.log(`📦 Se encontraron ${products.length} productos en el sistema.`);

    // Assign visible products
    for (const p of products) {
        await prisma.consultantProduct.upsert({
            where: {
                consultantId_productId: {
                    consultantId: consultant.id,
                    productId: p.id
                }
            },
            update: { isVisible: true },
            create: {
                consultantId: consultant.id,
                productId: p.id,
                isVisible: true
            }
        });
        console.log(`   -> Asignado: ${p.name}`);
    }

    console.log('🎉 Todo listo. Los productos deberían ser visibles ahora.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
