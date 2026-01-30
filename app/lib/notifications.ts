
import prisma from '@/lib/prisma';
import { NotificationType, RecipientType } from '@prisma/client';

interface NotificationContext {
    orderId?: string;
    payoutId?: string;
    // Dynamic data for templates
    clientName?: string;
    consultantName?: string;
    totalAmount?: number | string;
    cycleName?: string;
    [key: string]: any;
}

/**
 * Core Notification Service
 * Handles:
 * 1. Templating (Spanish)
 * 2. DB Logging
 * 3. Sending (Mock Provider)
 */
export async function sendNotification(
    type: NotificationType,
    recipientType: RecipientType,
    recipientId: string,
    context: NotificationContext
) {
    console.log(`🔔 Preparing Notification: ${type} -> ${recipientType} (${recipientId})`);

    // 1. Resolve Template
    const message = getTemplate(type, context);

    // 2. Mock Provider Send (Future: Twilio/Meta API)
    const success = await mockWhatsAppProviderSend(recipientId, message);
    const status = success ? 'SENT' : 'FAILED';

    // 3. Log to Database
    /* 
       Note: We use a try-catch for DB logging to ensure that even if DB fails,
       the operation flow isn't necessarily broken, although ideally we need the log.
       For this MVP, we proceed.
    */
    try {
        await prisma.notification.create({
            data: {
                type,
                channel: 'WHATSAPP',
                recipientType,
                recipientId,
                orderId: context.orderId,
                payoutId: context.payoutId,
                message,
                status,
                sentAt: success ? new Date() : null,
                metadata: { context }
            }
        });
    } catch (dbError) {
        console.error("Failed to log notification to DB:", dbError);
    }

    return { success, message };
}

/**
 * Provider Abstraction (Mock)
 */
async function mockWhatsAppProviderSend(to: string, body: string): Promise<boolean> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 100));

    console.log(`
    📱 [WHATSAPP MOCK] 
    TO: ${to}
    BODY: 
    "${body}"
    -----------------------------
    `);

    return true; // Always succeed for MVP
}

/**
 * Templates (Spanish)
 */
function getTemplate(type: NotificationType, ctx: NotificationContext): string {
    const { clientName = 'Cliente', consultantName = 'Consultora', totalAmount = '0.00', orderId, cycleName } = ctx;
    const shortOrderId = orderId ? orderId.slice(0, 8) : '???';

    switch (type) {
        // Customer Messages
        case 'ORDER_CREATED':
            return `Hola ${clientName} 👋\nHemos recibido tu pedido *#${shortOrderId}*.\nEsperando confirmación de ${consultantName}.`;

        case 'ORDER_CONFIRMED':
            return `Hola ${clientName} 👋\nTu pedido *#${shortOrderId}* ha sido *confirmado* ✅\nTotal: *S/ ${totalAmount}*\nTe avisaremos cuando esté en camino 🚚\nGracias por comprar con ${consultantName} 💖`;

        case 'ORDER_IN_TRANSIT':
            return `🚚 ¡Buenas noticias ${clientName}!\nTu pedido *#${shortOrderId}* está *en camino*.\nPrepárate para recibirlo pronto.`;

        case 'ORDER_DELIVERED':
            return `🎉 ¡Pedido entregado!\nEsperamos que disfrutes tus productos.\nCualquier consulta, escríbenos por aquí 😊`;

        case 'ORDER_CANCELED':
            return `Hola ${clientName}.\nLamentamos informarte que tu pedido *#${shortOrderId}* ha sido cancelado ❌.\nContacta a tu consultora para más detalles.`;

        // Consultant Messages
        case 'PAYOUT_AVAILABLE':
            return `💰 Hola ${consultantName}\nTienes una *liquidación disponible* del ciclo **${cycleName}**\nTotal: **S/ ${totalAmount}**\nRevisa tu dashboard para más detalles.`;

        default:
            return `Nueva notificación: ${type}`;
    }
}
