import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { DashboardProductDetail } from '@/components/dashboard/catalog/DashboardProductDetail';

interface PageProps {
    params: Promise<{
        sku: string;
    }>;
}

export const dynamic = 'force-dynamic';

export default async function DashboardProductDetailPage({ params }: PageProps) {
    const { sku } = await params;
    const SLUG = 'daniel-patroni'; // Using fixed slug context

    // 1. Fetch Consultant
    const consultant = await prisma.consultant.findUnique({
        where: { slug: SLUG },
        select: { id: true }
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
            cyclePrices: {
                where: activeCycle ? { cycleId: activeCycle.id } : { id: 'none' }
            },
            promotions: {
                where: activeCycle ? {
                    promotion: {
                        isActive: true,
                        cycleId: activeCycle.id,
                        startDate: { lte: new Date() },
                        endDate: { gte: new Date() }
                    }
                } : { promotionId: 'none' },
                include: { promotion: true }
            }
        }
    });

    if (!product) {
        notFound();
    }

    // 4. Calculate Prices
    const mainPrice = product.cyclePrices[0];
    const basePrice = Number(product.price);
    let promotionalPrice = mainPrice?.isPromotional ? Number(mainPrice.price) : null;

    // Apply "Promociones Pro" Logic
    // We explicitly check if promotions exists to satisfy TS
    const activePromo = product.promotions?.[0]?.promotion;
    if (activePromo) {
        if (activePromo.discountType === 'FIXED_PRICE') {
            promotionalPrice = Number(activePromo.discountValue);
        } else if (activePromo.discountType === 'PERCENTAGE') {
            const discount = basePrice * (Number(activePromo.discountValue) / 100);
            promotionalPrice = basePrice - discount;
        }
    }

    const finalPrice = promotionalPrice ?? basePrice;

    return (
        <DashboardProductDetail
            consultantId={consultant.id}
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
