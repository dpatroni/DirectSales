
'use server';

import prisma from '@/lib/prisma';

/**
 * Repeats a previous order by creating a new cart with available items.
 * Uses CURRENT prices and checks stock/status.
 */
export async function repeatOrder(customerId: string, originalOrderId: string) {
    console.log(`🔄 Repeating Order: ${originalOrderId} for Customer: ${customerId}`);

    // 1. Fetch Original Order & Items
    const originalOrder = await prisma.order.findUnique({
        where: { id: originalOrderId },
        include: { items: true }
    });

    if (!originalOrder || originalOrder.customerId !== customerId) {
        return { success: false, message: "Pedido no encontrado o acceso denegado." };
    }

    // 2. Get Active Cycle & Context
    const activeCycle = await prisma.cycle.findFirst({
        where: { isActive: true }
    });

    if (!activeCycle) {
        return { success: false, message: "No hay un ciclo activo para realizar pedidos." };
    }

    // 3. Create New Cart (Clean Slate)
    // We create a fresh cart linked to the cycle. 
    // Since Cart doesn't have customerId in MVP (it's cookie/session based),
    // we return the new cartId for the UI to "adopt".
    // We need consultantId. Original order has it. We assume reorder is with SAME consultant.

    const newCart = await prisma.cart.create({
        data: {
            cycleId: activeCycle.id,
            consultantId: originalOrder.consultantId // Sticky consultant
        }
    });

    // 4. Migrate Items (Validation & Recalculation)
    const warnings: string[] = [];
    const addedItems = [];

    for (const item of originalOrder.items) {
        if (!item.productId) continue;

        // Fetch current Product state
        const product = await prisma.product.findUnique({
            where: { id: item.productId }
        });

        // Checks
        if (!product) {
            warnings.push(`Producto "${item.nameSnapshot}" ya no existe.`);
            continue;
        }

        // Add to Cart
        // Note: CartItem usually doesn't store price, it references Product.
        // We just add Product + Qty + Variant.
        await prisma.cartItem.create({
            data: {
                cartId: newCart.id,
                productId: product.id,
                quantity: item.quantity,
                selectedVariant: item.selectedVariant || {}
            }
        });

        addedItems.push(product.name);
    }

    if (addedItems.length === 0) {
        // Cleanup empty cart
        await prisma.cart.delete({ where: { id: newCart.id } });
        return { success: false, message: "Ninguno de los productos originales está disponible." };
    }

    return {
        success: true,
        cartId: newCart.id,
        warnings,
        message: warnings.length > 0
            ? "Pedido clonado con advertencias (algunos productos no disponibles)."
            : "Pedido clonado exitosamente."
    };
}
