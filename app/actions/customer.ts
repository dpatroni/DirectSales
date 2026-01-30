
'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'customer_token';

/**
 * Identifies a customer by phone number within a consultant's scope.
 * If not found, creates a new Customer record.
 * Sets a cookie to persist the session.
 */
export async function identifyCustomer(
    consultantId: string,
    data: { name: string; phone: string; email?: string }
) {
    if (!consultantId || !data.phone || !data.name) {
        throw new Error('Missing required fields');
    }

    // Normalize phone (simple removal of spaces/dashes)
    const normalizedPhone = data.phone.replace(/\D/g, '');

    // 1. Find existing customer
    let customer = await prisma.customer.findFirst({
        where: {
            consultantId: consultantId,
            phone: normalizedPhone
        }
    });

    // 2. Create if not exists
    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                consultantId,
                fullName: data.name,
                phone: normalizedPhone,
                email: data.email
            }
        });
    } else {
        // Optional: Update name if provided? 
        // For now, let's keep original unless explicitly requested to update.
    }

    // 3. Set Cookie (Simulated Auth)
    // In a real app, sign this ID with a secret (JWT).
    // For MVP, plain ID is "acceptable" if we assume low risk, but better to be safe.
    // We will store just the UUID.
    (await cookies()).set(COOKIE_NAME, customer.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
    });

    return { success: true, customerId: customer.id };
}

export async function getCustomerSession() {
    const customerId = (await cookies()).get(COOKIE_NAME)?.value;
    if (!customerId) return null;

    const customer = await prisma.customer.findUnique({
        where: { id: customerId }
    });

    return customer;
}

export async function logoutCustomer() {
    (await cookies()).delete(COOKIE_NAME);
    return { success: true };
}
