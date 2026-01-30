import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RECOVERY_MAP: Record<string, string> = {
    'NAT-001': 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw2043697e/images/products/73846/73846.jpg', // Ekos Castaña
    'NAT-002': 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw8d55734e/images/products/69124/69124.jpg', // Kaiak Clásico
    'KAIAK01': 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw8d55734e/images/products/69124/69124.jpg',
    'EKOS01': 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw2043697e/images/products/73846/73846.jpg',
    'CHRONOS01': 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw1d965d56/images/products/91849/91849.jpg',
    'LUMINA01': 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dwc7365027/images/products/86940/86940.jpg',
    'TODODIA01': 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw8c86365b/images/products/86861/86861.jpg',
    'ILIA01': 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw849479b0/images/products/44452/44452.jpg',
    'LABIAL01': 'https://production.na01.natura.com/on/demandware.static/-/Sites-natura-br-storefront-catalog/default/dw478028f0/images/products/109265/109265.jpg'
};

async function main() {
    console.log('💊 Recovering Natura Image URLs...');

    for (const [sku, imageUrl] of Object.entries(RECOVERY_MAP)) {
        const product = await prisma.product.findUnique({ where: { sku } });
        if (product) {
            await prisma.product.update({
                where: { sku },
                data: { imageUrl }
            });
            console.log(`✅ Recovered ${product.name} (${sku})`);
        } else {
            console.log(`⚠️ SKU ${sku} not found`);
        }
    }

    console.log('✨ Recovery finished.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
