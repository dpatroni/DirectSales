import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const TEST_EMAIL = 'dpatroniv+test1@gmail.com'
    console.log('🔍 Debugging Save Action for:', TEST_EMAIL)

    // 1. Find User
    const consultant = await prisma.consultant.findFirst({
        where: { email: TEST_EMAIL }
    })

    if (!consultant) {
        console.error('❌ User not found!')
        return
    }
    console.log('✅ User found:', consultant.id)

    // 2. Fetch a valid brand to test with
    const brand = await prisma.brand.findFirst({ where: { slug: 'natura' } })
    if (!brand) {
        console.error('❌ Brand specific "natura" not found, fetching any...')
        const anyBrand = await prisma.brand.findFirst()
        if (!anyBrand) {
            console.error('❌ NO BRANDS FOUND IN DB')
            return
        }
        console.log('⚠️ Using fallback brand:', anyBrand.name, anyBrand.id)
    } else {
        console.log('✅ Brand "Natura" found:', brand.id)
    }

    const brandIdToUse = brand ? brand.id : (await prisma.brand.findFirst())?.id

    // 3. Attempt Update
    try {
        console.log('📝 Attempting update with:', {
            name: 'Daniel Patroni (Debug)',
            primaryBrandId: brandIdToUse,
            phone: '+51 983115213'
        })

        const updated = await prisma.consultant.update({
            where: { id: consultant.id },
            data: {
                name: 'Daniel Patroni (Debug)',
                primaryBrandId: brandIdToUse || '',
                phone: '+51 983115213',
            }
        })
        console.log('✅ SUCCESS! Updated slug:', updated.slug)
    } catch (e: any) {
        console.error('❌ UPDATE FAILED')
        console.error(e)
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
