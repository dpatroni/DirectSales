'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { calculateApproveCommission } from './commissions';
import { sendNotification } from '@/app/lib/notifications';

export async function createOrderFromCart(
    consultantId: string,
    cartId: string,
    clientInfo: { name: string; phone: string; customerId?: string }
) {
    // 1. Get Cart with Items validation
    const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            cyclePrices: true,
                            promotions: {
                                include: { promotion: true },
                                where: { promotion: { isActive: true } }
                            }
                        }
                    },
                    bundle: true // For future bundle support
                }
            },
            cycle: true
        }
    });

    if (!cart) throw new Error("Carrito no encontrado");
    if (!(cart as any).cycleId) throw new Error("El carrito no pertenece a un ciclo activo");
    if ((cart as any).items.length === 0) throw new Error("El carrito está vacío");

    // 2. Validate Active Cycle
    const activeCycle = await prisma.cycle.findFirst({
        where: { id: (cart as any).cycleId, isActive: true }
    });

    if (!activeCycle) throw new Error("El ciclo del carrito ya no está activo");

    // 3. Calculate Totals & Build Items
    let subtotal = 0;
    let discountTotal = 0;

    // Helper to generate text snapshot
    let messageLines: string[] = [`*Pedido - ${activeCycle.name}*`];
    messageLines.push(`Consultora: *${clientInfo.name}*`); // Using client name as consultant name context is user-centric in WA
    messageLines.push("--------------------------------");

    const orderItemsData: any[] = [];

    for (const item of (cart as any).items) {
        if (!item.product) continue; // Skip bundles for this MVP or handle similarly

        const product = item.product;
        const quantity = item.quantity;

        // Base Price (Cycle Price)
        const cyclePriceObj = product.cyclePrices.find((cp: any) => cp.cycleId === activeCycle.id);
        const basePrice = Number(cyclePriceObj?.price || product.price);

        let unitPrice = basePrice;
        let finalUnitPrice = basePrice;
        let promoId = null;

        // Apply Promotion Logic (matches Catalog Logic)
        // Filter strictly for this cycle and current date validity
        const activePromo = product.promotions.find((p: any) =>
            p.promotion.cycleId === activeCycle.id &&
            p.promotion.isActive &&
            new Date(p.promotion.startDate) <= new Date() &&
            new Date(p.promotion.endDate) >= new Date()
        )?.promotion;

        if (activePromo) {
            promoId = activePromo.id;
            if (activePromo.discountType === 'FIXED_PRICE') {
                finalUnitPrice = Number(activePromo.discountValue);
            } else if (activePromo.discountType === 'PERCENTAGE') {
                const discount = basePrice * (Number(activePromo.discountValue) / 100);
                finalUnitPrice = basePrice - discount;
            }
        }

        const lineTotal = finalUnitPrice * quantity;
        const lineSubtotal = basePrice * quantity;
        const lineDiscount = lineSubtotal - lineTotal;

        subtotal += lineSubtotal;
        discountTotal += lineDiscount;

        orderItemsData.push({
            productId: product.id,
            quantity: quantity,
            nameSnapshot: product.name,
            pointsSnapshot: product.points,
            isRefillSnapshot: product.isRefill,
            unitPrice: basePrice,
            promoId: promoId,
            finalPrice: finalUnitPrice,
            selectedVariant: item.selectedVariant || undefined
        });

        // Add to WA message
        const variantText = item.selectedVariant ? ` (${(item.selectedVariant as any).name})` : '';
        const priceText = lineDiscount > 0
            ? `~S/ ${basePrice.toFixed(2)}~ *S/ ${finalUnitPrice.toFixed(2)}*`
            : `S/ ${basePrice.toFixed(2)}`;

        messageLines.push(`${quantity}x ${product.name}${variantText}`);
        messageLines.push(`   ${priceText}  = S/ ${lineTotal.toFixed(2)}`);
    }

    const total = subtotal - discountTotal;

    messageLines.push("--------------------------------");
    messageLines.push(`Subtotal: S/ ${subtotal.toFixed(2)}`);
    if (discountTotal > 0) {
        messageLines.push(`Ahorro: S/ ${discountTotal.toFixed(2)}`);
    }
    messageLines.push(`*TOTAL: S/ ${total.toFixed(2)}*`);

    const whatsappMessage = messageLines.join('\n');

    // 4. Create Order Transaction
    const order = await prisma.$transaction(async (tx) => {
        // Create Order
        const newOrder = await tx.order.create({
            data: {
                consultantId: consultantId,
                cycleId: activeCycle.id,
                status: 'DRAFT', // Will switch to SENT on redirect
                subtotal: subtotal,
                discountTotal: discountTotal,
                total: total,
                whatsappMessage: whatsappMessage,
                clientName: clientInfo.name,
                clientPhone: clientInfo.phone,
                customerId: clientInfo.customerId, // LINKED
                items: {
                    create: orderItemsData as any
                }
            }
        });

        // Clear Cart? (Requirement says "NO romper carrito existing"... usually converting cart to order implies clearing, 
        // but user emphasizes persistence. We will clear items to avoid double ordering, or keep them if user wants "Draft" logic.
        // Given request "Confirmar pedido -> Persistir en DB -> Redirigir", usually implies cart consumed.
        // Safest approach for "Professional Order": Empty the cart after successful order creation.
        await tx.cartItem.deleteMany({
            where: { cartId: cart.id }
        });

        return newOrder;
    });

    // 5. Calculate Commissions (REMOVED in Status PRO)
    // Commission is now triggered when Consultant confirms the order status.
    // See: updateOrderStatus in app/actions/orders.ts

    // 5. Notifications
    try {
        // Notify Consultant
        await sendNotification('ORDER_CREATED', 'CONSULTANT', consultantId, {
            orderId: order.id,
            clientName: clientInfo.name
        });

        // Notify Customer (if registered)
        if (clientInfo.customerId) {
            await sendNotification('ORDER_CREATED', 'CUSTOMER', clientInfo.customerId, {
                orderId: order.id,
                consultantName: 'Tu Consultora' // Better fetching real name if possible, but MVP ok
            });
        }
    } catch (e) {
        console.error("Notification Error", e);
    }

    return { success: true, orderId: order.id, whatsappMessage };
}

export async function updateOrderStatus(orderId: string, newStatus: 'PENDING' | 'CONFIRMED' | 'ORDERED_TO_BRAND' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELED') {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true, consultant: true }
    });

    if (!order) throw new Error("Order not found");

    // Logic: Validate Transition if needed (e.g., prevent going back from Delivered to Pending)
    // For MVP transparency: Consultants can fix mistakes, so we allow most transitions, 
    // EXCEPT commissions handling needs care.

    // Update Timestamps
    const data: any = {
        status: newStatus,
        statusUpdatedAt: new Date()
    };

    if (newStatus === 'CONFIRMED' && order.status !== 'CONFIRMED') {
        data.confirmedAt = new Date();
    }

    if (newStatus === 'CANCELED') {
        data.canceledAt = new Date();
    }

    await prisma.order.update({
        where: { id: orderId },
        data
    });

    // Side Effects

    // 1. CONFIRMED -> Generate Commission
    if (newStatus === 'CONFIRMED') {
        try {
            await calculateApproveCommission(orderId);
        } catch (e) {
            console.error("Commission Error", e);
        }
    }

    // 2. CANCELED -> Void Commission
    if (newStatus === 'CANCELED') {
        await prisma.commission.updateMany({
            where: { orderId: orderId },
            data: { status: 'CANCELLED' }
        });
    }

    // 3. Notifications (Async)
    try {
        const notifContext = {
            orderId: orderId,
            clientName: order.customer?.fullName || order.clientName || 'Cliente',
            consultantName: order.consultant.name,
            totalAmount: Number(order.total).toFixed(2)
        };

        let notifType: any = null;
        if (newStatus === 'CONFIRMED') notifType = 'ORDER_CONFIRMED';
        if (newStatus === 'IN_TRANSIT') notifType = 'ORDER_IN_TRANSIT';
        if (newStatus === 'DELIVERED') notifType = 'ORDER_DELIVERED';
        if (newStatus === 'CANCELED') notifType = 'ORDER_CANCELED';

        if (notifType && order.customerId) {
            await sendNotification(notifType, 'CUSTOMER', order.customerId, notifContext);
        }
    } catch (e) {
        console.error("Notification Error", e);
    }

    try {
        revalidatePath('/dashboard/orders');
        revalidatePath(`/dashboard/orders/${orderId}`);
    } catch (error) {
        // Ignored during script execution
    }

    return { success: true };
}

export async function markOrderAsSent(orderId: string) {
    // Legacy support or alias to updateOrderStatus
    await updateOrderStatus(orderId, 'PENDING'); // "Sent" via WA implies Pending confirmation
}
