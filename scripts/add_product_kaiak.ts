import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const TEST_EMAIL = 'dpatroniv+test2@gmail.com'

    console.log('🔄 Agregando "Kaiak Oceano Femenino" para:', TEST_EMAIL)

    const consultant = await prisma.consultant.findFirst({
        where: { email: TEST_EMAIL },
        include: { primaryBrand: true }
    })

    if (!consultant) {
        console.error('❌ Consultor no encontrado.')
        return
    }

    let brandId = consultant.primaryBrandId

    // If consultant has no brand, find one (Natura) and assign it
    if (!brandId) {
        console.log('⚠️ Consultor sin marca. Buscando marca "Natura"...')
        const naturaBrand = await prisma.brand.findFirst({
            where: { slug: 'natura' }
        })

        if (naturaBrand) {
            console.log('✅ Marca Natura encontrada. Asignando...')
            brandId = naturaBrand.id
            await prisma.consultant.update({
                where: { id: consultant.id },
                data: { primaryBrandId: brandId }
            })
        } else {
            console.error('❌ No se encontró la marca "Natura". Creando una...')
            const newBrand = await prisma.brand.create({
                data: {
                    name: 'Natura',
                    slug: 'natura',
                    isActive: true
                }
            })
            brandId = newBrand.id
            await prisma.consultant.update({
                where: { id: consultant.id },
                data: { primaryBrandId: brandId }
            })
        }
    }

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

    // 2. Create the Product
    const sku = "232059"

    // Check if exists to update or create
    const product = await prisma.product.upsert({
        where: { sku: sku },
        update: {
            name: 'Set Kaiak Oceano Femenino',
            description: '1 eau de toilette femenina 100 ml, 1 jabón en barra puro vegetal 90g, 1 desodorante corporal en spray 100 ml. Floral frutal, algas marinas, pataqueira, frutal acuático. Intensidad moderada.',
            price: 113.00,
            points: 39,
            imageUrl: '/products/kaiak_oceano_set.png', // Local image from upload
            brandId: brandId,
            categoryId: category.id
        },
        create: {
            name: 'Set Kaiak Oceano Femenino',
            description: '1 eau de toilette femenina 100 ml, 1 jabón en barra puro vegetal 90g, 1 desodorante corporal en spray 100 ml. Floral frutal, algas marinas, pataqueira, frutal acuático. Intensidad moderada.',
            sku: sku,
            price: 113.00,
            points: 39,
            imageUrl: '/products/kaiak_oceano_set.png',
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
