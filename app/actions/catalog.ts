'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type CatalogFilters = {
    query?: string;
    brandId?: string;
    categoryId?: string;
    isPromo?: boolean;
};

export async function getManagementCatalog(filters?: CatalogFilters) {
    const SLUG = 'daniel-patroni'; // Using fixed slug as authentication context for now

    const consultant = await prisma.consultant.findUnique({
        where: { slug: SLUG },
    });

    if (!consultant) return [];

    // Fetch active cycle for pricing
    const activeCycle = await prisma.cycle.findFirst({
        where: { isActive: true }
    });

    // Build Where Clause
    const whereClause: any = {
        consultantId: consultant.id,
        isVisible: true, // Only show visible products by default? Or show all and let toggle? User req implies "Catalog view", usually visible ones.
        product: {}
    };

    if (filters?.query) {
        whereClause.product.OR = [
            { name: { contains: filters.query, mode: 'insensitive' } },
            { description: { contains: filters.query, mode: 'insensitive' } },
            { sku: { contains: filters.query, mode: 'insensitive' } }
        ];
    }

    if (filters?.brandId) {
        whereClause.product.brandId = filters.brandId;
    }

    if (filters?.categoryId) {
        whereClause.product.categoryId = filters.categoryId;
    }

    if (filters?.isPromo && activeCycle) {
        whereClause.OR = [
            {
                product: {
                    cyclePrices: {
                        some: {
                            cycleId: activeCycle.id,
                            isPromotional: true
                        }
                    }
                }
            },
            {
                product: {
                    promotions: {
                        some: {
                            promotion: {
                                isActive: true,
                                cycleId: activeCycle.id,
                                startDate: { lte: new Date() },
                                endDate: { gte: new Date() }
                            }
                        }
                    }
                }
            }
        ];
    }

    const items = await prisma.consultantProduct.findMany({
        where: whereClause,
        include: {
            product: {
                include: {
                    brand: true,
                    cyclePrices: {
                        where: { cycleId: activeCycle?.id }
                    },
                    promotions: {
                        where: {
                            promotion: {
                                isActive: true,
                                cycleId: activeCycle?.id,
                                startDate: { lte: new Date() },
                                endDate: { gte: new Date() }
                            }
                        },
                        include: { promotion: true }
                    }
                }
            }
        },
        orderBy: { product: { name: 'asc' } }
    });

    // Transform to UI friendly format matching the HTML needs
    return items.map(item => {
        const basePrice = Number(item.product.price);
        const cyclePriceObj = item.product.cyclePrices[0];
        let promotionalPrice: number | null = cyclePriceObj ? Number(cyclePriceObj.price) : null;
        let isPromotional = cyclePriceObj?.isPromotional || false;

        // Apply "Promociones Pro" Logic (Overwrites basic cycle price if better or exists)
        const activePromo = item.product.promotions[0]?.promotion;
        if (activePromo) {
            isPromotional = true;
            if (activePromo.discountType === 'FIXED_PRICE') {
                promotionalPrice = Number(activePromo.discountValue);
            } else if (activePromo.discountType === 'PERCENTAGE') {
                const discount = basePrice * (Number(activePromo.discountValue) / 100);
                promotionalPrice = basePrice - discount;
            }
        }

        return {
            id: item.product.id,
            name: item.product.name,
            sku: item.product.sku,
            description: item.product.description,
            imageUrl: item.product.imageUrl,
            brand: item.product.brand.name,
            isVisible: item.isVisible,
            price: basePrice,
            promotionalPrice: promotionalPrice,
            isPromotional: isPromotional,
            variants: item.product.variants // In case we need to show variant info
        };
    });
}

export async function getCatalogFilters() {
    // Get active brands
    const brands = await prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    // Get categories (optional, if we want to filter by category too)
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    });

    return { brands, categories };
}

export async function toggleProductVisibility(productId: string, isVisible: boolean) {
    const SLUG = 'daniel-patroni';

    const consultant = await prisma.consultant.findUnique({
        where: { slug: SLUG },
    });

    if (!consultant) throw new Error("Unauthorized");

    await prisma.consultantProduct.update({
        where: {
            consultantId_productId: {
                consultantId: consultant.id,
                productId: productId
            }
        },
        data: { isVisible }
    });

    // Optimization: Do NOT revalidate path immediately to avoid UI stutter on rapid toggles.
    // The client component has valid optimistic state.
    // revalidatePath('/dashboard/catalog'); 
    return { success: true };
}
