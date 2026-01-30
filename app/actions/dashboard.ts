
'use server';

import prisma from '@/lib/prisma';
import { differenceInDays } from 'date-fns';

export async function getConsultantDashboardData() {
    // 1. Get Consultant (Hardcoded for MVP)
    const SLUG = 'daniel-patroni';
    const consultant = await prisma.consultant.findUnique({
        where: { slug: SLUG },
        include: { primaryBrand: true }
    });

    if (!consultant) return null;

    // 2. Get Active Cycle
    const activeCycle = await prisma.cycle.findFirst({
        where: { isActive: true }
    });

    const today = new Date();
    const cycleData = activeCycle ? {
        name: activeCycle.name,
        daysRemaining: differenceInDays(new Date(activeCycle.endDate), today),
        progress: 0 // Could calculate days passed vs total duration
    } : {
        name: "Sin Ciclo Activo",
        daysRemaining: 0,
        progress: 0
    };

    // 3. Aggregate KPIs (Current Cycle)
    let cycleSales = 0;
    let estimatedEarnings = 0;
    let activeOrdersCount = 0;

    if (activeCycle) {
        // Sales (Total of Valid Orders)
        const orders = await prisma.order.findMany({
            where: {
                consultantId: consultant.id,
                cycleId: activeCycle.id,
                status: { not: 'CANCELED' } // Include Pending? Yes, typically "Venta"
            },
            select: { total: true, status: true }
        });
        cycleSales = orders.reduce((sum, o) => sum + Number(o.total), 0);

        // Active Orders (Not Delivered/Canceled)
        activeOrdersCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELED').length;

        // Earnings (Commission from Orders)
        const commissions = await prisma.commission.findMany({
            where: {
                consultantId: consultant.id,
                cycleId: activeCycle.id,
                status: 'VALID'
            },
            select: { commissionAmount: true }
        });
        estimatedEarnings = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    }

    // 4. Customers
    const clientsCount = await prisma.customer.count({
        where: { consultantId: consultant.id }
    });

    // New Customers (This Cycle - approximation)
    const newClientsCount = activeCycle ? await prisma.customer.count({
        where: {
            consultantId: consultant.id,
            createdAt: { gte: activeCycle.startDate }
        }
    }) : 0;

    // 5. Recent Orders
    const recentOrders = await prisma.order.findMany({
        where: { consultantId: consultant.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true }
    });

    // 6. Payout Status
    // Check if there is a pending payout for ANY cycle or specifically logic of "Requestable"
    // Usually we check if there are commissions eligible for payout that are NOT yet in a payout.
    // Or check if there is a generated Payout in PENDING status.
    const pendingPayout = await prisma.payout.findFirst({
        where: {
            consultantId: consultant.id,
            status: 'PENDING'
        }
    });

    const availableForPayout = !pendingPayout; // Simplified trigger logic

    return {
        consultant: {
            name: consultant.name,
            level: 'Consultora Bronce', // Hardcoded level logic for now
            avatarUrl: consultant.avatarUrl,
        },
        cycle: cycleData,
        kpis: {
            sales: cycleSales.toFixed(2),
            earnings: estimatedEarnings.toFixed(2),
            activeOrders: activeOrdersCount,
            totalClients: clientsCount,
            newClients: newClientsCount
        },
        recentOrders: recentOrders.map(o => ({
            id: o.id,
            clientName: o.clientName || o.customer?.fullName || 'Cliente',
            total: Number(o.total).toFixed(2),
            status: o.status,
            date: o.createdAt
        })),
        payoutAction: {
            hasPending: !!pendingPayout,
            canRequest: availableForPayout && estimatedEarnings > 0 // Logic ref check
        }
    };
}
