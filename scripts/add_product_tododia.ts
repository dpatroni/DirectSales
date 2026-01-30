import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const TEST_EMAIL = 'dpatroniv+test2@gmail.com'

    console.log('🔄 Agregando "Kit Tododia Piel Uniforme" para:', TEST_EMAIL)

    const consultant = await prisma.consultant.findFirst({
        where: { email: TEST_EMAIL },
        include: { primaryBrand: true }
    })

    if (!consultant) {
        console.error('❌ Consultor no encontrado.')
        return
    }

    let brandId = consultant.primaryBrandId

    // Double check brand if missing
    if (!brandId) {
        const natura = await prisma.brand.findFirst({ where: { slug: 'natura' } })
        if (natura) brandId = natura.id
    }

    if (!brandId) { console.error('No brand found'); return }

    // 1. Ensure Category "Cuidados Diarios" exists
    const category = await prisma.category.upsert({
        where: { slug: "cuidados-diarios" },
        update: {},
        create: {
            name: "Cuidados Diarios",
            slug: "cuidados-diarios",
            brandId: brandId
        }
    })

    // 2. Create/Update the Product
    const sku = "234315"

    // Note: Price is discounted to 82.30
    const product = await prisma.product.upsert({
        where: { sku: sku },
        update: {
            name: 'Kit Tododia Piel Uniforme',
            description: '1 Hidratante corporal 400 ml, 1 Exfoliante nutritivo 190 g, 1 Desodorante antitranspirante roll-on 70 ml. Nutrición radiante, pera y flor de loto.',
            price: 82.30,
            points: 25,
            imageUrl: '/products/tododia_set.png',
            brandId: brandId,
            categoryId: category.id
        },
        create: {
            name: 'Kit Tododia Piel Uniforme',
            description: '1 Hidratante corporal 400 ml, 1 Exfoliante nutritivo 190 g, 1 Desodorante antitranspirante roll-on 70 ml. Nutrición radiante, pera y flor de loto.',
            sku: sku,
            price: 82.30,
            points: 25,
            imageUrl: '/products/tododia_set.png',
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
