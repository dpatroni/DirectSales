import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const TEST_EMAIL = 'dpatroniv+test2@gmail.com'

    console.log('🔄 Agregando "Set Kaiak Oceano Masculino" para:', TEST_EMAIL)

    const consultant = await prisma.consultant.findFirst({
        where: { email: TEST_EMAIL },
        include: { primaryBrand: true }
    })

    if (!consultant) {
        console.error('❌ Consultor no encontrado.')
        return
    }

    let brandId = consultant.primaryBrandId
    if (!brandId) {
        const natura = await prisma.brand.findFirst({ where: { slug: 'natura' } })
        if (natura) brandId = natura.id
    }
    if (!brandId) { console.error('No brand found'); return }

    // 1. Ensure Category "Perfumería" exists
    const categoryName = "Perfumería"
    const category = await prisma.category.upsert({
        where: { slug: "perfumeria" },
        update: {},
        create: {
            name: categoryName,
            slug: "perfumeria",
            brandId: brandId
        }
    })

    // 2. Create/Update the Product
    const sku = "232050"

    const product = await prisma.product.upsert({
        where: { sku: sku },
        update: {
            name: 'Set Kaiak Oceano Masculino',
            description: '1 eau de toilette masculino 100 ml, 1 jabón en barra puro vegetal 90 g, 1 desodorante corporal en spray 100 ml. Aromático amaderado, algas marinas, pataqueira, complejo acuático.',
            price: 113.00,
            points: 39,
            imageUrl: '/products/kaiak_oceano_masc_set.png',
            brandId: brandId,
            categoryId: category.id
        },
        create: {
            name: 'Set Kaiak Oceano Masculino',
            description: '1 eau de toilette masculino 100 ml, 1 jabón en barra puro vegetal 90 g, 1 desodorante corporal en spray 100 ml. Aromático amaderado, algas marinas, pataqueira, complejo acuático.',
            sku: sku,
            price: 113.00,
            points: 39,
            imageUrl: '/products/kaiak_oceano_masc_set.png',
            brandId: brandId,
            categoryId: category.id,
            isRefill: false
        }
    })

    console.log(`✅ Producto Agregado: ${product.name} (SKU: ${product.sku})`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
