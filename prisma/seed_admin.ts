import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address: npm run seed-admin <email>');
        process.exit(1);
    }

    console.log(`Seeding Admin: ${email}...`);

    try {
        const admin = await prisma.admin.upsert({
            where: { email },
            update: {},
            create: {
                email,
            },
        });

        console.log(`✅ Admin created/verified: ${admin.email}`);
        console.log(`ℹ️  Link this admin to Supabase Auth by logging in with this email and updating the authId manually or via future logic.`);

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
