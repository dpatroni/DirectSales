'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const CART_COOKIE_NAME = 'natura_cart_id';

// Helper: Get Cart ID from cookie
async function getCartId() {
    const cookieStore = await cookies();
    const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
    return cartId;
}

// 1. Get or Create Cart
export async function getOrCreateCart(consultantId: string) {
    const cartId = await getCartId();

    if (cartId) {
        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                cyclePrices: true
                            }
                        },
                        bundle: true
                    }
                }
            }
        });

        if (cart) return cart;
    }

    // If no cart or invalid ID, create new one
    // Check for active cycle first
    const activeCycle = await prisma.cycle.findFirst({
        where: { isActive: true }
    });

    const cart = await prisma.cart.create({
        data: {
            consultantId,
            cycleId: activeCycle?.id
        },
        include: { items: true }
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(CART_COOKIE_NAME, cart.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });

    return cart;
}

// 2. Add to Cart
export async function addToCart(consultantId: string, productId: string, quantity: number = 1) {
    const cart = await getOrCreateCart(consultantId);

    // Check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId: productId
        }
    });

    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity }
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: productId,
                quantity: quantity
            }
        });
    }

    revalidatePath('/'); // Revalidate all pages to update Sticky Cart
    return { success: true };
}

// 3. Update Item Quantity
export async function updateItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
        await prisma.cartItem.delete({
            where: { id: itemId }
        });
    } else {
        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity }
        });
    }

    revalidatePath('/');
    return { success: true };
}

// 4. Remove Item
export async function removeCartItem(itemId: string) {
    await prisma.cartItem.delete({
        where: { id: itemId }
    });

    revalidatePath('/');
    return { success: true };
}

// 5. Get Cart Summary (Helper for UI)
export async function getCartSummary() {
    const cartId = await getCartId();
    if (!cartId) return null;

    const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            cyclePrices: true
                        }
                    }
                }
            }
        }
    });

    if (!cart) return null;

    // Calculate totals
    let totalMoney = 0;
    let totalPoints = 0;
    let itemCount = 0;

    for (const item of cart.items) {
        if (item.product) {
            // Logic: Use Cycle Price if available and matching cart cycle, else base price
            // Note: Cart schema has cycleId, ensuring consistency.

            const cyclePrice = item.product.cyclePrices.find(cp => cp.cycleId === cart.cycleId);
            const price = cyclePrice ? Number(cyclePrice.price) : Number(item.product.price);

            totalMoney += price * item.quantity;
            totalPoints += item.product.points * item.quantity;
            itemCount += item.quantity;
        }
    }

    return {
        cartId: cart.id,
        totalMoney,
        totalPoints,
        itemCount,
        items: cart.items
    };
}

// 6. Checkout Actions

export async function createOrderFromCart(clientInfo?: { name: string; phone?: string }) {
    const cartId = await getCartId();
    if (!cartId) throw new Error("No cart found");

    const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            cyclePrices: true
                        }
                    }
                }
            }
        }
    });

    if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
    }

    // Calculate totals and prepare snapshot items
    let totalMoney = 0;
    let totalPoints = 0;

    type OrderItemInput = {
        productId: string;
        quantity: number;
        nameSnapshot: string;
        priceSnapshot: number; // Will convert to Decimal
        pointsSnapshot: number;
        isRefillSnapshot: boolean;
    };

    const orderItemsData: OrderItemInput[] = [];

    for (const item of cart.items) {
        if (item.product) {
            const p = item.product;
            const cyclePrice = p.cyclePrices.find(cp => cp.cycleId === cart.cycleId);
            const price = cyclePrice ? Number(cyclePrice.price) : Number(p.price);

            totalMoney += price * item.quantity;
            totalPoints += p.points * item.quantity;

            orderItemsData.push({
                productId: p.id,
                quantity: item.quantity,
                nameSnapshot: p.name,
                priceSnapshot: price,
                pointsSnapshot: p.points,
                isRefillSnapshot: p.isRefill,
            });
        }
    }

    // Transaction: Create Order -> Add Items -> Delete Cart Items
    const order = await prisma.$transaction(async (tx) => {
        // 1. Create Order
        const newOrder = await tx.order.create({
            data: {
                consultantId: cart.consultantId,
                cycleId: cart.cycleId,
                totalMoney: totalMoney, // Prisma handles number -> Decimal
                totalPoints: totalPoints,
                status: 'DRAFT',
                clientName: clientInfo?.name,
                clientPhone: clientInfo?.phone
            }
        });

        // 2. Create Order Items
        for (const itemData of orderItemsData) {
            await tx.orderItem.create({
                data: {
                    orderId: newOrder.id,
                    productId: itemData.productId,
                    quantity: itemData.quantity,
                    nameSnapshot: itemData.nameSnapshot,
                    priceSnapshot: itemData.priceSnapshot,
                    pointsSnapshot: itemData.pointsSnapshot,
                    isRefillSnapshot: itemData.isRefillSnapshot
                }
            });
        }

        // 3. Clear Cart (Delete Cart Items)
        await tx.cartItem.deleteMany({
            where: { cartId: cart.id }
        });

        return newOrder;
    });

    // Persist Order ID in client cookie for history
    const cookieStore = await cookies();
    const currentHistory = cookieStore.get('client_orders')?.value;
    let orderIds: string[] = [];

    if (currentHistory) {
        try {
            orderIds = JSON.parse(currentHistory);
        } catch (e) {
            orderIds = [];
        }
    }

    orderIds.push(order.id);

    // Dedup
    orderIds = Array.from(new Set(orderIds));

    cookieStore.set('client_orders', JSON.stringify(orderIds), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365 // 1 year
    });

    revalidatePath('/');
    return { success: true, orderId: order.id };
}

export async function markOrderAsSent(orderId: string) {
    await prisma.order.update({
        where: { id: orderId },
        data: { status: 'SENT' }
    });
    revalidatePath(`/order/${orderId}`);
    revalidatePath('/history');
    return { success: true };
}

// 7. Client History & Profile Actions

export async function getClientOrders() {
    const cookieStore = await cookies();
    const currentHistory = cookieStore.get('client_orders')?.value;

    if (!currentHistory) return [];

    try {
        const orderIds = JSON.parse(currentHistory);
        if (!Array.isArray(orderIds) || orderIds.length === 0) return [];

        const orders = await prisma.order.findMany({
            where: { id: { in: orderIds } },
            orderBy: { createdAt: 'desc' },
            include: {
                consultant: true,
                cycle: true
            }
        });
        return orders;
    } catch (e) {
        return [];
    }
}

export async function getCurrentShoppingConsultant() {
    const cartId = await getCartId();
    if (!cartId) return null;

    const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { consultant: true }
    });

    return cart?.consultant || null;
}
