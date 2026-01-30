
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Calculates and creates commission records for a given order.
 * This should be called when an order is created or confirmed.
 * 
 * Logic:
 * 1. Fetch Order with Items and their Products/Brands.
 * 2. Group items by Brand.
 * 3. Verify if Commission already exists for this Order + Brand (Idempotency).
 * 4. Get Commission Rate from Brand (defaultCommissionRate).
 * 5. Calculate Commission = Sum(finalPrice * qty) * Rate.
 * 6. Persist to DB.
 */
export async function calculateApproveCommission(orderId: string) {
    // 1. Fetch Order Data
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            brand: true
                        }
                    }
                }
            },
            cycle: true,
            consultant: true
        }
    });

    if (!order) throw new Error(`Order ${orderId} not found`);

    if (order.items.length === 0) {
        console.warn(`Order ${orderId} has no items. No commission calculated.`);
        return;
    }

    // 2. Group by Brand
    // Map<BrandId, Items[]>
    const itemsByBrand = new Map<string, typeof order.items>();

    for (const item of order.items) {
        if (!item.product) continue; // Should not happen for valid products

        const brandId = item.product.brandId;
        if (!itemsByBrand.has(brandId)) {
            itemsByBrand.set(brandId, []);
        }
        itemsByBrand.get(brandId)?.push(item);
    }

    // 3. Process each Brand
    const createdCommissions = [];

    for (const [brandId, brandItems] of itemsByBrand.entries()) {
        const brand = brandItems[0].product?.brand;
        if (!brand) continue;

        // Check for existing commission to prevent duplicates
        const existing = await prisma.commission.findFirst({
            where: {
                orderId: order.id,
                brandId: brandId
            }
        });

        if (existing) {
            // Idempotency: skip if exists
            continue;
        }

        // Calculate Gross Amount (Venta Real)
        const grossAmount = brandItems.reduce((sum, item) => {
            return sum + (Number(item.finalPrice) * item.quantity);
        }, 0);

        // Get Rate
        const rate = Number(brand.defaultCommissionRate);

        // Calculate Commission
        const commissionAmount = grossAmount * rate;

        // Persist
        const commission = await prisma.commission.create({
            data: {
                consultantId: order.consultantId,
                orderId: order.id,
                cycleId: order.cycleId,
                brandId: brandId,
                grossAmount: grossAmount,
                commissionAmount: commissionAmount,
                commissionRate: rate,
                status: 'VALID'
            }
        });

        createdCommissions.push(commission);
    }

    // Revalidate relevant paths
    try {
        revalidatePath('/dashboard/earnings');
        revalidatePath('/dashboard/ganancias');
        revalidatePath('/admin/commissions');
    } catch (e) {
        // Ignored during script execution
    }

    return { success: true, count: createdCommissions.length };
}

export async function getConsultantEarnings(consultantId: string, cycleId?: string) {
    const where: any = {
        consultantId: consultantId,
        status: 'VALID'
    };

    if (cycleId) {
        where.cycleId = cycleId;
    }

    const commissions = await prisma.commission.findMany({
        where,
        include: {
            brand: true,
            order: true,
            cycle: true
        },
        orderBy: { createdAt: 'desc' }
    });

    // KPI Calculations

    // 1. Current Cycle Total (or filtered total)
    const totalEarnings = commissions.reduce((acc, c) => acc + Number(c.commissionAmount), 0);

    // 2. Historical Total (All Time)
    // Note: This fetches purely based on consultant, ignoring the cycle filter unless specifically needed?
    // Requirement implies "Ganancia acumulada" is always global history.
    const historicalCommissions = await prisma.commission.findMany({
        where: { consultantId: consultantId, status: 'VALID' }
    });
    const historicalTotal = historicalCommissions.reduce((acc, c) => acc + Number(c.commissionAmount), 0);

    // 3. Group by Brand (for Chart and Best Brand)
    const brandMap = new Map<string, number>();

    for (const c of commissions) {
        const amount = Number(c.commissionAmount);
        const brandName = c.brand.name;
        brandMap.set(brandName, (brandMap.get(brandName) || 0) + amount);
    }

    // 4. Determine Best Brand
    let bestBrand = { name: 'N/A', amount: 0 };
    const chartData: { name: string; value: number; fill: string }[] = [];
    const colors = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0']; // Shades of Emerald
    let colorIndex = 0;

    for (const [name, value] of brandMap.entries()) {
        if (value > bestBrand.amount) {
            bestBrand = { name, amount: value };
        }
        chartData.push({
            name,
            value,
            fill: colors[colorIndex % colors.length]
        });
        colorIndex++;
    }

    return {
        commissions,
        totalEarnings,
        historicalTotal,
        byBrand: Object.fromEntries(brandMap),
        bestBrand,
        chartData,
        orderCount: commissions.length
    };
}
