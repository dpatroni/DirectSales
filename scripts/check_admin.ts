
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking Admin Table...');
    const admins = await prisma.admin.findMany();
    console.log(`Found ${admins.length} admins.`);
    console.table(admins);

    console.log('🔍 Checking Brands...');
    const brands = await prisma.brand.findMany();
    console.log(`Found ${brands.length} brands.`);
    console.table(brands);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
