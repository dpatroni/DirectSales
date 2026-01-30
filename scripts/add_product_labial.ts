import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const TEST_EMAIL = 'dpatroniv+test2@gmail.com'

    console.log('🔄 Agregando "Labial CC Hidratante" con variantes para:', TEST_EMAIL)

    const consultant = await prisma.consultant.findFirst({
        where: { email: TEST_EMAIL },
        include: { primaryBrand: true }
    })

    if (!consultant) { console.error('❌ Consultor no encontrado.'); return }
    let brandId = consultant.primaryBrandId
    if (!brandId) {
        const natura = await prisma.brand.findFirst({ where: { slug: 'natura' } })
        if (natura) brandId = natura.id
    }
    if (!brandId) { console.error('No brand found'); return }

    // 1. Ensure Category "Maquillaje" exists
    const categoryName = "Maquillaje"
    const category = await prisma.category.upsert({
        where: { slug: "maquillaje" },
        update: {},
        create: {
            name: categoryName,
            slug: "maquillaje",
            brandId: brandId
        }
    })

    // 2. Define Variants
    const variants = [
        { name: "Nude 10C", sku: "92526", color: "#A05F55" },
        { name: "Rouge 4C", sku: "92531", color: "#9E1C22" },
        { name: "Rose 4C", sku: "92520", color: "#D6345D" },
        { name: "Rose 2C", sku: "93506", color: "#AC7870" },
        { name: "Terracota 8C", sku: "92525", color: "#964B3E" },
        { name: "Violeta 4C", sku: "92530", color: "#953F54" },
        { name: "Rouge 8C", sku: "92529", color: "#912E2F" },
        { name: "Violeta 6C", sku: "93505", color: "#7D5863" },
        { name: "Rouge 2C", sku: "93504", color: "#A8483E" },
        { name: "Nude 2C", sku: "92536", color: "#AB635B" }
    ]

    // 3. Create Product
    // We use a "Parent SKU" or simply the first variant's SKU as DB identifier if we want
    // But better to use a generic SKU for the "Group" product in this visual model logic
    const groupSku = "LABIAL_CC_GROUP"

    const product = await prisma.product.upsert({
        where: { sku: groupSku },
        update: {
            name: 'Labial CC Hidratante Una',
            description: 'Labial CC hidratante 3.8 g. 10 beneficios reales: acción antiseñales, larga duración, volumen, alta cobertura. Elige tu tono.',
            price: 37.10,
            points: 11,
            imageUrl: '/products/labial_cc.png',
            brandId: brandId,
            categoryId: category.id,
            variants: variants
        },
        create: {
            name: 'Labial CC Hidratante Una',
            description: 'Labial CC hidratante 3.8 g. 10 beneficios reales: acción antiseñales, larga duración, volumen, alta cobertura. Elige tu tono.',
            sku: groupSku,
            price: 37.10,
            points: 11,
            imageUrl: '/products/labial_cc.png',
            brandId: brandId,
            categoryId: category.id,
            isRefill: false,
            variants: variants
        }
    })

    console.log(`✅ Producto Agregado con Variantes: ${product.name}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
