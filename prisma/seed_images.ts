
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Product Images...');

    // Generic high-quality beauty product images from Unsplash
    const images = [
        'https://images.unsplash.com/photo-1571781565036-d3f7595ca3e4?q=80&w=600&auto=format&fit=crop', // Cream
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop', // Purple Bottle
        'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=600&auto=format&fit=crop', // Shampoo
        'https://images.unsplash.com/photo-1556228720-1915d0705f64?q=80&w=600&auto=format&fit=crop', // Oil
        'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop', // Green Bottle
    ];

    const products = await prisma.product.findMany();

    for (const [index, product] of products.entries()) {
        const imageUrl = images[index % images.length];

        await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl }
        });

        console.log(`Updated ${product.name} with image.`);
    }

    console.log(`✅ Updated ${products.length} products.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
