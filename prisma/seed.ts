import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Brand: Natura
  // Using upsert on unique slug
  const naturaBrand = await prisma.brand.upsert({
    where: { slug: 'natura' },
    update: {},
    create: {
      name: 'Natura',
      slug: 'natura',
    },
  })
  console.log(`✅ Brand: ${naturaBrand.name}`)

  // 2. Bioactives: Castaña, Tukumã, Andiroba
  // Name is not unique in schema, so we check first to avoid duplicates
  const bioactivesList = ['Castaña', 'Tukumã', 'Andiroba']
  const bioactivesMap: Record<string, string> = {}

  for (const name of bioactivesList) {
    const existing = await prisma.bioactive.findFirst({ where: { name } })
    if (existing) {
      bioactivesMap[name] = existing.id
      console.log(`ℹ️  Bioactive already exists: ${name}`)
    } else {
      const created = await prisma.bioactive.create({ data: { name } })
      bioactivesMap[name] = created.id
      console.log(`✅ Bioactive created: ${name}`)
    }
  }

  // 3. Products
  // 3a. Regular Product
  // SKU: NAT-001 (Ekos Castaña Pulpa)
  const regularProduct = await prisma.product.upsert({
    where: { sku: 'NAT-001' },
    update: {},
    create: {
      sku: 'NAT-001',
      name: 'Ekos Castaña Pulpa Hidratante',
      description: 'Pulpa hidratante corporal 400ml',
      price: 64.00,
      points: 14,
      isRefill: false,
      brand: { connect: { id: naturaBrand.id } },
      bioactives: {
        create: {
          bioactive: { connect: { id: bioactivesMap['Castaña'] } }
        }
      }
    },
  })
  console.log(`✅ Product Regular: ${regularProduct.name}`)

  // 3b. Refill Product linked to Regular
  // SKU: NAT-001-R
  const refillProduct = await prisma.product.upsert({
    where: { sku: 'NAT-001-R' },
    update: {},
    create: {
      sku: 'NAT-001-R',
      name: 'Repuesto Ekos Castaña',
      description: 'Repuesto pulpa hidratante 400ml',
      price: 52.90,
      points: 11,
      isRefill: true,
      brand: { connect: { id: naturaBrand.id } },
      parentProduct: { connect: { id: regularProduct.id } }, // Self-reference
      bioactives: {
        create: {
          bioactive: { connect: { id: bioactivesMap['Castaña'] } }
        }
      }
    },
  })
  console.log(`✅ Product Refill: ${refillProduct.name}`)

  // 4. Cycle: Ciclo 03/2026
  // Name is not unique, check first.
  const cycleName = 'Ciclo 03/2026'
  let cycle = await prisma.cycle.findFirst({ where: { name: cycleName } })

  if (!cycle) {
    cycle = await prisma.cycle.create({
      data: {
        name: cycleName,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-21'),
        isActive: true,
      }
    })
    console.log(`✅ Cycle created: ${cycle.name}`)
  } else {
    console.log(`ℹ️  Cycle already exists: ${cycle.name}`)
  }

  // 5. Cycle Product Price
  // Promotional price for Regular Product in this Cycle
  const promoPrice = await prisma.cycleProductPrice.upsert({
    where: {
      cycleId_productId: {
        cycleId: cycle.id,
        productId: regularProduct.id
      }
    },
    update: {},
    create: {
      cycleId: cycle.id,
      productId: regularProduct.id,
      price: 49.90, // Promotional price
      isPromotional: true
    }
  })
  console.log(`✅ Price configured for ${regularProduct.sku} in ${cycle.name}: ${promoPrice.price}`)

  // 6. Consultant: Connie Salas
  const consultant = await prisma.consultant.upsert({
    where: { slug: 'connie-salas' },
    update: {},
    create: {
      name: 'Connie Salas',
      slug: 'connie-salas',
      bio: 'Consultora Natura Diamante. Apasionada por la belleza y el bienestar. ¡Escríbeme para recomendaciones personalizadas!',
      phone: '+51 987 654 321',
      email: 'connie.salas@example.com',
      avatarUrl: 'https://ui-avatars.com/api/?name=Connie+Salas&background=FF9900&color=fff'
    }
  })
  console.log(`✅ Consultant: ${consultant.name}`)

  // 7. Consultant Products (Activate products for this consultant)
  // Activate Regular Product
  await prisma.consultantProduct.upsert({
    where: {
      consultantId_productId: {
        consultantId: consultant.id,
        productId: regularProduct.id
      }
    },
    update: { isVisible: true },
    create: {
      consultantId: consultant.id,
      productId: regularProduct.id,
      isVisible: true
    }
  })

  // Activate Refill Product
  await prisma.consultantProduct.upsert({
    where: {
      consultantId_productId: {
        consultantId: consultant.id,
        productId: refillProduct.id
      }
    },
    update: { isVisible: true },
    create: {
      consultantId: consultant.id,
      productId: refillProduct.id,
      isVisible: true
    }
  })
  console.log(`✅ Products activated for consultant`)

  console.log('🏁 Seed finished successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
