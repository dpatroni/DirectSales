'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DiscountType } from '@prisma/client';

export type PromotionInput = {
    id?: string;
    name: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: Date;
    endDate: Date;
    cycleId: string;
    isActive: boolean;
    productIds: string[];
}

// 1. Get Promotions (List)
export async function getAdminPromotions(cycleId?: string) {
    const whereClause: any = {};
    if (cycleId) {
        whereClause.cycleId = cycleId;
    }

    const promotions = await prisma.promotion.findMany({
        where: whereClause,
        include: {
            cycle: true,
            _count: {
                select: { products: true }
            }
        },
        orderBy: { startDate: 'desc' }
    });

    return promotions;
}

// 2. Get Single Promotion (Edit)
export async function getAdminPromotion(id: string) {
    const promotion = await prisma.promotion.findUnique({
        where: { id },
        include: {
            products: {
                include: { product: true }
            }
        }
    });
    return promotion;
}

// 3. Create or Update Promotion
export async function upsertPromotion(data: PromotionInput) {
    const { id, productIds, ...coreData } = data;

    try {
        if (id) {
            // Update
            await prisma.promotion.update({
                where: { id },
                data: {
                    ...coreData,
                    products: {
                        deleteMany: {}, // Reset relations
                        create: productIds.map(pid => ({ productId: pid }))
                    }
                }
            });
        } else {
            // Create
            await prisma.promotion.create({
                data: {
                    ...coreData,
                    products: {
                        create: productIds.map(pid => ({ productId: pid }))
                    }
                }
            });
        }
        revalidatePath('/admin/promotions');
        return { success: true };
    } catch (e) {
        console.error("Error upserting promotion:", e);
        return { success: false, error: "Failed to save promotion" };
    }
}

// 4. Toggle Active Status
export async function togglePromotionStatus(id: string, isActive: boolean) {
    await prisma.promotion.update({
        where: { id },
        data: { isActive }
    });
    revalidatePath('/admin/promotions');
    return { success: true };
}

// 5. Delete Promotion
export async function deletePromotion(id: string) {
    await prisma.promotion.delete({
        where: { id }
    });
    revalidatePath('/admin/promotions');
    return { success: true };
}

// Helper: Get Products for Selector
export async function getProductsForSelector() {
    return prisma.product.findMany({
        select: { id: true, name: true, sku: true, imageUrl: true },
        orderBy: { name: 'asc' }
    });
}

// Helper: Get Cycles for Selector
export async function getCyclesForSelector() {
    return prisma.cycle.findMany({
        select: { id: true, name: true, isActive: true },
        orderBy: { startDate: 'desc' }
    });
}
