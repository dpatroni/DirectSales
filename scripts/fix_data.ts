
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🛠️ Fixing Data State...');

    // 1. Create Admin
    const adminEmail = 'dpatroniv@gmail.com';
    console.log(`👤 Creating Admin: ${adminEmail}`);
    await prisma.admin.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail
        }
    });
    console.log('✅ Admin created/verified.');

    // 2. Seed Brands
    const brandsData = [
        { name: 'Natura', slug: 'natura' },
        { name: 'Ésika', slug: 'esika' },
        { name: 'Yanbal', slug: 'yanbal' },
        { name: 'Otros', slug: 'otros' },
    ];

    console.log('🏷️ Seeding Brands...');
    for (const b of brandsData) {
        await prisma.brand.upsert({
            where: { slug: b.slug },
            update: { isActive: true }, // Ensure active
            create: {
                name: b.name,
                slug: b.slug,
                isActive: true
            }
        });
    }
    console.log('✅ Brands seeded.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
