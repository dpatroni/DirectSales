import prisma from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { notFound } from 'next/navigation';
import { CheckCircle, MessageCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { markOrderAsSent } from '@/app/actions';

interface PageProps {
    params: Promise<{
        orderId: string;
    }>;
}

export default async function OrderPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { orderId } = resolvedParams;

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            consultant: true,
            cycle: true,
            items: true
        }
    });

    if (!order) notFound();

    // Calculate formatted totals for display
    const totalMoney = Number(order.totalMoney);
    const totalPoints = order.totalPoints;

    // WhatsApp Message Generation
    // Reuse logic but now from Order Items (immutable)
    const waItems = order.items.map(item => {
        return `${item.quantity}x ${item.nameSnapshot} (S/ ${Number(item.priceSnapshot).toFixed(2)})`;
    }).join('%0A');

    const waTotal = `Total: S/ ${totalMoney.toFixed(2)}`;
    const waPoints = `Puntos: ${totalPoints} pts`;
    const waOrderId = `Order ID: ${order.id.split('-')[0]}`; // Short ID for readability

    const waText = `Hola ${order.consultant.name}, confirmo mi pedido del ${order.cycle?.name || 'Ciclo Actual'}:%0A%0A${waOrderId}%0A${waItems}%0A%0A${waTotal}%0A${waPoints}`;
    const whatsappUrl = `https://wa.me/?text=${waText}`;

    // Server Action wrapper for button (Client Component usually, but we can stick to form or simple link if we accept status update is implicit or handled by client interaction separately. 
    // However, requirements say "Al enviar por WhatsApp -> Cambiar status".
    // Let's make a Client Component for the "Send to WhatsApp" button to handle the status update reliably.)

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header consultantName={order.consultant.name} />

            <main className="container mx-auto px-4 py-6 max-w-2xl">

                {/* Status Badge */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">¡Pedido Generado!</h1>
                    <p className="text-gray-500 mt-1">Tu pedido ha sido guardado correctamente.</p>

                    <div className="mt-4 px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wide border border-yellow-200">
                        Estado: {order.status === 'DRAFT' ? 'Pendiente de Envío' : 'Enviado'}
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <span className="font-bold text-gray-700">Resumen del Pedido</span>
                        <span className="text-xs text-gray-500">#{order.id.split('-')[0]}</span>
                    </div>

                    {order.items.map((item) => (
                        <div key={item.id} className="p-4 border-b last:border-0 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-900">{item.quantity}x {item.nameSnapshot}</p>
                                {item.isRefillSnapshot && (
                                    <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded border border-green-200">Repuesto</span>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">S/ {(Number(item.priceSnapshot) * item.quantity).toFixed(2)}</p>
                                <p className="text-xs text-emerald-600 font-medium">{item.pointsSnapshot * item.quantity} pts</p>
                            </div>
                        </div>
                    ))}

                    <div className="p-4 bg-gray-50 flex justify-between items-center border-t">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Total a Pagar</p>
                            <p className="text-xl font-bold text-gray-900">S/ {totalMoney.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">Total Puntos</p>
                            <p className="text-lg font-bold text-emerald-600">💎 {totalPoints} pts</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <form action={async () => {
                        'use server';
                        await markOrderAsSent(order.id);
                        redirect(whatsappUrl); // Redirect to WhatsApp
                    }}>
                        {/* 
                    Note: redirect() in Server Action throws NEXT_REDIRECT, handled by Next.js.
                    However, opening new tab/app from server action redirect is tricky.
                    Better approach: Client Component that calls action then window.open.
                    I will use a client component wrapper below for robustness.
                 */}
                        <OrderActions orderId={order.id} whatsappUrl={whatsappUrl} />
                    </form>

                    <Link href="/" className="block w-full text-center py-3 text-gray-600 font-medium hover:text-gray-900">
                        Volver al Catálogo
                    </Link>
                </div>
            </main>
        </div>
    );
}

// Inline Client Component for Actions to avoid creating another file
import { redirect } from 'next/navigation';
import { OrderActions } from './OrderActions'; 
