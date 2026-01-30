
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Brands
  const brandsData = [
    { name: 'Natura', slug: 'natura' },
    { name: 'Ésika', slug: 'esika' },
    { name: 'Yanbal', slug: 'yanbal' },
    { name: 'Otros', slug: 'otros' },
  ];

  const brandsMap: Record<string, string> = {};

  for (const b of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        name: b.name,
        slug: b.slug,
        isActive: true
      }
    });
    brandsMap[b.name] = brand.id;
    console.log(`✅ Brand: ${brand.name}`);
  }

  const naturaBrandId = brandsMap['Natura'];

  // 2. Bioactives
  const bioactivesList = ['Castaña', 'Tukumã', 'Andiroba']
  const bioactivesMap: Record<string, string> = {}

  for (const name of bioactivesList) {
    const existing = await prisma.bioactive.findFirst({ where: { name } })
    if (existing) {
      bioactivesMap[name] = existing.id
    } else {
      const created = await prisma.bioactive.create({ data: { name } })
      bioactivesMap[name] = created.id
    }
  }

  // 3. Products
  // 3a. Regular Product (Ekos Castaña)
  const regularProduct = await prisma.product.upsert({
    where: { sku: 'NAT-001' },
    update: {},
    create: {
      sku: 'NAT-001',
      name: 'Ekos Castaña Pulpa Hidratante',
      description: 'Pulpa hidratante corporal 400ml',
      price: 64.00,
      points: 14,
      imageUrl: 'https://production.na01.natura.com/html/html-global/0/img/prods/PE/512x512/72973.png',
      brand: { connect: { id: naturaBrandId } },
      bioactives: {
        create: { bioactive: { connect: { id: bioactivesMap['Castaña'] } } }
      }
    },
  })

  // 3b. Refill Product
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
      imageUrl: 'https://production.na01.natura.com/html/html-global/0/img/prods/PE/512x512/72974.png',
      brand: { connect: { id: naturaBrandId } },
      parentProduct: { connect: { id: regularProduct.id } },
      bioactives: {
        create: { bioactive: { connect: { id: bioactivesMap['Castaña'] } } }
      }
    },
  })

  // 3c. Another Product (Kaiak)
  const kaiakProduct = await prisma.product.upsert({
    where: { sku: 'NAT-002' },
    update: {},
    create: {
      sku: 'NAT-002',
      name: 'Kaiak Clásico Masculino',
      description: 'Eau de Toilette 100ml. Aromático herbal, leve.',
      price: 128.00,
      points: 28,
      imageUrl: 'https://production.na01.natura.com/html/html-global/0/img/prods/PE/512x512/22560.png',
      brand: { connect: { id: naturaBrandId } }
    }
  })

  // 4. Cycle: Ciclo 03/2026
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
  }

  // 5. Cycle Product Prices
  await prisma.cycleProductPrice.upsert({
    where: { cycleId_productId: { cycleId: cycle.id, productId: regularProduct.id } },
    update: {},
    create: { cycleId: cycle.id, productId: regularProduct.id, price: 49.90, isPromotional: true }
  })

  await prisma.cycleProductPrice.upsert({
    where: { cycleId_productId: { cycleId: cycle.id, productId: kaiakProduct.id } },
    update: {},
    create: { cycleId: cycle.id, productId: kaiakProduct.id, price: 99.90, isPromotional: true }
  })

  // ----------------------------------------------------
  // USERS
  // ----------------------------------------------------

  // 6. Admin
  await prisma.admin.upsert({
    where: { email: 'admin@sales.com' },
    update: {},
    create: {
      email: 'admin@sales.com',
      authId: 'admin-auth-uuid-placeholder' // User must map this manually if using Supabase Auth
    }
  });
  console.log(`✅ Admin: admin@sales.com`);

  // 7. Consultant: Connie Salas
  const consultant = await prisma.consultant.upsert({
    where: { slug: 'connie-salas' },
    update: {
      primaryBrandId: naturaBrandId // Ensure brand link
    },
    create: {
      name: 'Connie Salas',
      slug: 'connie-salas',
      bio: 'Consultora Natura Diamante. Apasionada por la belleza.',
      phone: '+51 987 654 321',
      email: 'consultora@sales.com',
      avatarUrl: 'https://ui-avatars.com/api/?name=Connie+Salas&background=FF9900&color=fff',
      authId: 'consultant-auth-uuid-placeholder',
      primaryBrandId: naturaBrandId
    }
  })
  console.log(`✅ Consultant: ${consultant.name}`);

  // Activate Products for Consultant
  const productsToActivate = [regularProduct, refillProduct, kaiakProduct];
  for (const p of productsToActivate) {
    await prisma.consultantProduct.upsert({
      where: { consultantId_productId: { consultantId: consultant.id, productId: p.id } },
      update: { isVisible: true },
      create: { consultantId: consultant.id, productId: p.id, isVisible: true }
    })
  }

  // 8. Customer: Cliente
  const customer = await prisma.customer.create({
    data: {
      fullName: 'Carolina Cliente',
      phone: '+51 999 888 777',
      email: 'cliente@sales.com',
      consultantId: consultant.id
    }
  });
  console.log(`✅ Customer: ${customer.fullName} (ID: ${customer.id})`);

  // ----------------------------------------------------
  // ORDERS & DATA
  // ----------------------------------------------------

  // Order 1: Delivered
  const order1 = await prisma.order.create({
    data: {
      cycleId: cycle.id,
      consultantId: consultant.id,
      customerId: customer.id,
      status: 'DELIVERED',
      subtotal: 99.90,
      discountTotal: 28.10,
      total: 99.90,
      whatsappMessage: "Pedido de prueba 1",
      items: {
        create: {
          productId: kaiakProduct.id,
          nameSnapshot: kaiakProduct.name,
          unitPrice: 99.90,
          finalPrice: 99.90,
          pointsSnapshot: 28,
          isRefillSnapshot: false,
          quantity: 1,
          selectedVariant: {}
        }
      }
    }
  });

  // Commission for Order 1
  await prisma.commission.create({
    data: {
      grossAmount: 99.90,
      commissionRate: 0.30, // 30%
      commissionAmount: 29.97,
      status: 'VALID',
      consultantId: consultant.id,
      orderId: order1.id,
      cycleId: cycle.id,
      brandId: naturaBrandId
    }
  });

  // Order 2: Confirmed
  const order2 = await prisma.order.create({
    data: {
      cycleId: cycle.id,
      consultantId: consultant.id,
      customerId: customer.id,
      status: 'CONFIRMED',
      subtotal: 128.00, // 2x Ekos
      discountTotal: 28.20,
      total: 99.80, // 2 * 49.90
      whatsappMessage: "Pedido de prueba 2",
      items: {
        create: {
          productId: regularProduct.id,
          nameSnapshot: regularProduct.name,
          unitPrice: 64.00,
          finalPrice: 49.90,
          pointsSnapshot: 14,
          isRefillSnapshot: false,
          quantity: 2,
          selectedVariant: {}
        }
      }
    }
  });

  // Commission for Order 2
  await prisma.commission.create({
    data: {
      grossAmount: 99.80,
      commissionRate: 0.30,
      commissionAmount: 29.94,
      status: 'PENDING',
      consultantId: consultant.id,
      orderId: order2.id,
      cycleId: cycle.id,
      brandId: naturaBrandId
    }
  });

  // Order 3: Confirmed (Mixed)
  await prisma.order.create({
    data: {
      cycleId: cycle.id,
      consultantId: consultant.id,
      customerId: customer.id,
      status: 'CONFIRMED',
      subtotal: 52.90,
      discountTotal: 0,
      total: 52.90,
      whatsappMessage: "Pedido de prueba 3",
      items: {
        create: {
          productId: refillProduct.id,
          nameSnapshot: refillProduct.name,
          unitPrice: 52.90,
          finalPrice: 52.90,
          pointsSnapshot: 11,
          isRefillSnapshot: true,
          quantity: 1,
          selectedVariant: {}
        }
      }
    }
  });

  // Notifications
  await prisma.notification.create({
    data: {
      type: 'ORDER_CREATED',
      recipientType: 'CONSULTANT',
      recipientId: consultant.id,
      orderId: order2.id,
      message: `Nuevo pedido de ${customer.fullName}`,
      status: 'SENT'
    }
  });

  console.log(`✅ Orders, Commissions & Notifications seeded.`);
  console.log('🏁 Seed finished successfully');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
