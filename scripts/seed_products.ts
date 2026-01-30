import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const TEST_EMAIL = 'dpatroniv+test2@gmail.com'

    console.log('🔄 Iniciando migración de datos para:', TEST_EMAIL)

    // 1. Find the Consultant
    const consultant = await prisma.consultant.findFirst({
        where: { email: TEST_EMAIL },
        include: { primaryBrand: true }
    })

    if (!consultant || !consultant.primaryBrandId) {
        console.error('❌ Consultor no encontrado o sin marca asignada.')
        return
    }

    console.log(`✅ Consultor encontrado: ${consultant.name} (${consultant.primaryBrand?.name})`)
    const brandId = consultant.primaryBrandId

    // 2. Define Products to Seed
    // Mix of existing "Connie" products (re-created for this brand if needed, or ensuring they exist)
    // plus 2 NEW products as requested.
    const productsToSeed = [
        // Existing hits (ensuring they exist for this brand)
        {
            name: 'Kaiak Aero Masculino',
            description: 'Aromático herbal, moderado, notas acuosas.',
            price: 136.00,
            points: 19,
            sku: 'KAIAK01',
            imageUrl: 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw8d55734e/images/products/69124/69124.jpg',
            category: 'Perfumería'
        },
        {
            name: 'Pulpas Hidratantes Ekos Castaña',
            description: 'Hidratación nutritiva para manos y cuerpo.',
            price: 45.00,
            points: 8,
            sku: 'EKOS01',
            imageUrl: 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw2043697e/images/products/73846/73846.jpg',
            category: 'Cuerpo'
        },
        // NEW PRODUCT 1
        {
            name: 'Chronos Acqua Biohidratante',
            description: 'Hidratación inteligente que se adapta a tu piel. Acido hialurónico.',
            price: 108.00,
            points: 15,
            sku: 'CHRONOS01',
            imageUrl: 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw1d965d56/images/products/91849/91849.jpg',
            category: 'Rostro'
        },
        // NEW PRODUCT 2
        {
            name: 'Lumina Cabello Seco Shampoo',
            description: 'Reparación profunda para cabellos secos. Biotecnología Pró-teia.',
            price: 38.00,
            points: 6,
            sku: 'LUMINA01',
            imageUrl: 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dwc7365027/images/products/86940/86940.jpg',
            category: 'Cabello'
        },
        // NEW PRODUCT 3 (Bonus)
        {
            name: 'Jabones en Barra Tododia Surtidos',
            description: 'Limpieza suave que no reseca la piel. 5 unidades.',
            price: 29.00,
            points: 5,
            sku: 'TODODIA01',
            imageUrl: 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw8c86365b/images/products/86861/86861.jpg',
            category: 'Baño'
        }
    ]

    console.log('📦 Sembrando productos...')

    for (const p of productsToSeed) {
        // Upsert categories first
        const category = await prisma.category.upsert({
            where: { slug: p.category.toLowerCase() },
            update: {},
            create: {
                name: p.category,
                slug: p.category.toLowerCase(),
                brandId: brandId // Link category to brand roughly
            }
        })

        // Upsert Product
        await prisma.product.upsert({
            where: { sku: p.sku },
            update: {
                brandId: brandId, // Ensure it's linked to Daniel's brand
                categoryId: category.id
            },
            create: {
                name: p.name,
                description: p.description,
                price: p.price,
                points: p.points,
                sku: p.sku,
                imageUrl: p.imageUrl,
                isRefill: false,
                brandId: brandId,
                categoryId: category.id
            }
        })
    }

    console.log('✨ ¡Migración completada! Productos creados/actualizados.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
