import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const TEST_EMAIL = 'dpatroniv+test2@gmail.com'

    console.log('🔄 Agregando "Set Ilía Clásico" para:', TEST_EMAIL)

    const consultant = await prisma.consultant.findFirst({
        where: { email: TEST_EMAIL },
        include: { primaryBrand: true }
    })

    if (!consultant) {
        console.error('❌ Consultor no encontrado.')
        return
    }

    let brandId = consultant.primaryBrandId

    // Double check brand if missing (should exist now, but safe fallback)
    if (!brandId) {
        const natura = await prisma.brand.findFirst({ where: { slug: 'natura' } })
        if (natura) brandId = natura.id
    }

    if (!brandId) { console.error('No brand found'); return }

    // 1. Ensure Category "Perfumería" exists
    const category = await prisma.category.upsert({
        where: { slug: "perfumeria" },
        update: {},
        create: {
            name: "Perfumería",
            slug: "perfumeria",
            brandId: brandId
        }
    })

    // 2. Create/Update the Product
    const sku = "232055"

    const product = await prisma.product.upsert({
        where: { sku: sku },
        update: {
            name: 'Set Ilía Clásico',
            description: '1 eau de parfum femenina 50 ml (Floral, jazmín, vainilla, pomelo. Intensidad audaz). 1 hidratante corporal 80 ml. Limpia y perfuma la piel.',
            price: 98.00,
            points: 33,
            imageUrl: '/products/ilia_clasico_set.png',
            brandId: brandId,
            categoryId: category.id
        },
        create: {
            name: 'Set Ilía Clásico',
            description: '1 eau de parfum femenina 50 ml (Floral, jazmín, vainilla, pomelo. Intensidad audaz). 1 hidratante corporal 80 ml. Limpia y perfuma la piel.',
            sku: sku,
            price: 98.00,
            points: 33,
            imageUrl: '/products/ilia_clasico_set.png',
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
