'use server';

import prisma from '@/lib/prisma';

export async function getProductDetail(productId: string) {
    // Fetch active cycle for pricing
    const activeCycle = await prisma.cycle.findFirst({
        where: { isActive: true }
    });

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            brand: true,
            cyclePrices: {
                where: { cycleId: activeCycle?.id }
            },
            bundleItems: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!product) return null;

    return {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        brand: product.brand.name,
        points: product.points,
        price: product.price ? Number(product.price) : 0,
        promotionalPrice: product.cyclePrices[0] ? Number(product.cyclePrices[0].price) : null,
        isPromotional: product.cyclePrices[0]?.isPromotional || false,
        // Mocking set items if it's a bundle or just description parsing if needed
        // For now, if description contains newlines, we might split it, or if it's a bundle we show items
        setItems: product.bundleItems.map(item => item.product.name)
    };
}
