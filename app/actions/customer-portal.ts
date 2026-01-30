
'use server';

import prisma from '@/lib/prisma';

/**
 * Validates availability of a customer by ID.
 * Acts as a lightweight "Auth" check since the ID is the token.
 */
export async function verifyCustomerAccess(customerId: string) {
    if (!customerId) return null;

    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, fullName: true, phone: true }
    });

    return customer;
}

/**
 * Fetches the list of orders for a customer.
 * Read-only, safe data.
 */
export async function getCustomerOrders(customerId: string) {
    const orders = await prisma.order.findMany({
        where: { customerId: customerId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            createdAt: true,
            status: true,
            total: true,
            cycle: {
                select: { name: true }
            },
            items: {
                take: 3, // Preview first 3 items
                select: {
                    nameSnapshot: true,
                    quantity: true
                }
            },
            _count: {
                select: { items: true }
            }
        }
    });

    return orders;
}

/**
 * Fetches a single order detail.
 * Ensures the order belongs to the customer.
 */
export async function getCustomerOrder(customerId: string, orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: true,
            cycle: { select: { name: true } },
            consultant: { select: { name: true, phone: true } }
        }
    });

    // Security Check: Order MUST belong to the Customer
    if (!order || order.customerId !== customerId) {
        return null;
    }

    return order;
}
