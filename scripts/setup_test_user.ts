import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const TEST_EMAIL = 'dpatroniv+test2@gmail.com' // Using alias to bypass rate limit

    // 1. Ensure clean slate for this email (optional, but good practice if email was used elsewhere)
    // Since email isn't unique in schema, we'll just upsert a specific testing consultant

    const consultant = await prisma.consultant.upsert({
        where: { slug: 'daniel-patroni' },
        update: {
            email: TEST_EMAIL,
            name: 'Daniel Patroni',
            primaryBrandId: null, // Reset onboarding
            phone: null, // Reset onboarding
            authId: null // Allow auto-linking logic to trigger
        },
        create: {
            name: 'Daniel Patroni',
            slug: 'daniel-patroni',
            email: TEST_EMAIL,
            bio: 'Consultora Natura Digital (Testing)',
            avatarUrl: 'https://ui-avatars.com/api/?name=Daniel+Patroni&background=0D8ABC&color=fff',
            primaryBrandId: null,
            phone: null,
            authId: null
        }
    })

    console.log(`✅ Test User Configured:`)
    console.log(`   Name: ${consultant.name}`)
    console.log(`   Email: ${consultant.email}`)
    console.log(`   Slug: ${consultant.slug}`)
    console.log(`   Status: Ready for Onboarding (Clean state)`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
