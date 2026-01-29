'use client';

import { createOrderFromCart } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { getCartSummary } from '@/app/actions';
// Note: We need a way to get summary in Client Component, 
// OR we can pass it as props if this was a Server Component.
// Alternatively, we initiate the order creation here.

// But wait, the previous plan said /checkout/review page. 
// Let's make this page strictly for "Review & Confirm".

interface CheckoutReviewProps {
    summary: {
        totalMoney: number;
        totalPoints: number;
        itemCount: number;
        items: any[];
        cartId: string;
    } | null;
}

export function CheckoutReview({ summary }: CheckoutReviewProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    if (!summary || summary.itemCount === 0) {
        return (
            <div className="text-center py-10">
                <p>No hay items en el pedido.</p>
                <button onClick={() => router.push('/')} className="text-primary underline">Volver al catálogo</button>
            </div>
        )
    }

    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');

    const handleConfirmOrder = () => {
        if (!clientName.trim()) {
            alert('Por favor ingresa tu nombre');
            return;
        }

        startTransition(async () => {
            try {
                const result = await createOrderFromCart({
                    name: clientName,
                    phone: clientPhone
                });
                if (result.success) {
                    router.push(`/order/${result.orderId}`);
                }
            } catch (error) {
                alert('Error al crear el pedido. Intétalo de nuevo.');
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h2 className="font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    Resumen del Pedido
                </h2>

                <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 uppercase">Tus Datos</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (Requerido)</label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                            placeholder="Ej. María Pérez"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp (Opcional)</label>
                        <input
                            type="tel"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                            placeholder="Ej. 999 999 999"
                        />
                    </div>
                </div>

                <div className="space-y-3 pb-4 border-b border-gray-100">
                    {summary.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-start text-sm">
                            <span className="text-gray-600 flex-1">{item.product?.name || item.bundle?.name} (x{item.quantity})</span>
                            <div className="text-right">
                                {/* Only showing simple total here for review */}
                                {/* Ideally calculate price per item logic again or rely on summary/action data */}
                                {/* For MVP review, just listing items is okay-ish, but better if we had prices */}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center py-4 text-lg">
                    <span className="font-medium text-gray-600">Total a Pagar:</span>
                    <span className="font-bold text-gray-900">S/ {summary.totalMoney.toFixed(2)}</span>
                </div>

                <div className="flex justify-end items-center text-sm text-gray-500 gap-1">
                    <span>Acumulas:</span>
                    <span className="font-bold text-emerald-600">💎 {summary.totalPoints} pts</span>
                </div>
            </div>

            <div className="text-xs text-gray-500 text-center px-4">
                Al confirmar, el pedido se enviará a tu consultora por WhatsApp para coordinar el pago y la entrega.
            </div>

            <button
                onClick={handleConfirmOrder}
                disabled={isPending}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-lg shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Procesando...
                    </>
                ) : (
                    <>
                        Confirmar Pedido
                        <ArrowRight className="w-6 h-6" />
                    </>
                )}
            </button>
        </div>
    );
}
