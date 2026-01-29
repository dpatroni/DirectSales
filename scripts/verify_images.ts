
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking Product Images in Remote DB...');

    // Get all products
    const products = await prisma.product.findMany();

    // Log simplified view
    const status = products.map(p => ({
        name: p.name,
        hasImage: !!p.imageUrl,
        urlPreview: p.imageUrl ? p.imageUrl.substring(0, 30) + '...' : 'NULL'
    }));

    console.table(status);
}

main()
    .finally(() => prisma.$disconnect());
