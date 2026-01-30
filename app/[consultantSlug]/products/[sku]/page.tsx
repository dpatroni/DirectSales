import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProductDetailClient } from '@/components/ui/ProductDetailClient';

interface PageProps {
    params: Promise<{
        consultantSlug: string;
        sku: string;
    }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: PageProps) {
    const { consultantSlug, sku } = await params;

    // 1. Fetch Consultant
    const consultant = await prisma.consultant.findUnique({
        where: { slug: consultantSlug },
        select: { id: true, name: true, phone: true }
    });

    if (!consultant) {
        notFound();
    }

    // 2. Fetch Active Cycle (for promo price)
    const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });

    // 3. Fetch Product
    const product = await prisma.product.findUnique({
        where: { sku: sku },
        include: {
            cyclePrices: activeCycle ? {
                where: { cycleId: activeCycle.id }
            } : false
        }
    });

    if (!product) {
        notFound();
    }

    // 4. Calculate Prices
    const mainPrice = product.cyclePrices[0];
    const basePrice = Number(product.price);
    const promotionalPrice = mainPrice?.isPromotional ? Number(mainPrice.price) : null;
    const finalPrice = promotionalPrice ?? basePrice;

    return (
        <ProductDetailClient
            consultant={consultant}
            product={{
                id: product.id,
                sku: product.sku,
                name: product.name,
                description: product.description,
                basePrice: basePrice,
                price: finalPrice,
                points: product.points,
                imageUrl: product.imageUrl,
                variants: product.variants
            }}
        />
    );
}
