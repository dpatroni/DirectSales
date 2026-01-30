
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendNotification } from '@/app/lib/notifications';

/**
 * Generates a Payout for a specific consultant and cycle.
 * Rules:
 * - Aggregates all VALID commissions that are NOT yet paid (payoutId is null).
 * - STRICT: Only includes commissions where the associated Order is DELIVERED.
 * - Creates a Payout record.
 * - Updates the commissions to link to this Payout.
 */
export async function generatePayoutForCycle(consultantId: string, cycleId: string) {
    // 1. Check if Payout already exists
    const existingPayout = await prisma.payout.findUnique({
        where: {
            consultantId_cycleId: {
                consultantId,
                cycleId
            }
        }
    });

    if (existingPayout) {
        return { success: false, message: "Liquidación ya generada para este ciclo.", payoutId: existingPayout.id };
    }

    // 2. Fetch Eligible Commissions
    // Criteria: 
    // - Valid status
    // - No payout yet
    // - Order Status is DELIVERED (Strict rule for Payouts PRO)
    const eligibleCommissions = await prisma.commission.findMany({
        where: {
            consultantId,
            cycleId,
            status: 'VALID',
            payoutId: null,
            order: {
                status: 'DELIVERED'
            }
        }
    });

    if (eligibleCommissions.length === 0) {
        return { success: false, message: "No hay comisiones elegibles (entregadas) para liquidar." };
    }

    // 3. Calculate Total
    const totalAmount = eligibleCommissions.reduce((sum, comm) => sum + Number(comm.commissionAmount), 0);

    // 4. Create Payout Transaction
    const payout = await prisma.$transaction(async (tx) => {
        // Create Payout
        const newPayout = await tx.payout.create({
            data: {
                consultantId,
                cycleId,
                totalAmount,
                status: 'PENDING',
                generatedAt: new Date(),
            }
        });

        // Link Commissions
        await tx.commission.updateMany({
            where: {
                id: { in: eligibleCommissions.map(c => c.id) }
            },
            data: {
                payoutId: newPayout.id
            }
        });

        return newPayout;
    });

    // 5. Notify Consultant
    try {
        const cycle = await prisma.cycle.findUnique({ where: { id: cycleId } });
        await sendNotification('PAYOUT_AVAILABLE', 'CONSULTANT', consultantId, {
            payoutId: payout.id,
            totalAmount: totalAmount.toFixed(2),
            cycleName: cycle?.name || 'Ciclo'
        });
    } catch (e) {
        console.error("Notification Error", e);
    }

    try {
        revalidatePath('/dashboard/payouts');
        revalidatePath('/admin/payouts');
    } catch (e) {
        // Ignored in script context
    }

    return { success: true, payoutId: payout.id, amount: totalAmount };
}

export async function markPayoutAsPaid(payoutId: string) {
    await prisma.payout.update({
        where: { id: payoutId },
        data: {
            status: 'PAID',
            paidAt: new Date()
        }
    });

    try {
        revalidatePath('/admin/payouts');
        revalidatePath('/dashboard/payouts');
    } catch (e) {
        // Ignored
    }
}
