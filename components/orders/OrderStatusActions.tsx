
'use client';

import { updateOrderStatus } from '@/app/actions/orders';
import { useState, useTransition } from 'react';
import { CheckCircle, XCircle, Truck, Package, Send, Loader2 } from 'lucide-react';

interface Props {
    orderId: string;
    currentStatus: string; // Using string type to match prop, but logic handles enum
}

export function OrderStatusActions({ orderId, currentStatus }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleUpdate = (status: any) => {
        if (!confirm(`¿Estás segura de cambiar el estado a ${status}?`)) return;

        startTransition(async () => {
            await updateOrderStatus(orderId, status);
        });
    };

    if (currentStatus === 'CANCELED' || currentStatus === 'DELIVERED') {
        return null; // Terminal states
    }

    return (
        <div className="flex flex-col gap-2">

            {/* PENDING / DRAFT Flow */}
            {(currentStatus === 'PENDING' || currentStatus === 'DRAFT') && (
                <>
                    <button
                        disabled={isPending}
                        onClick={() => handleUpdate('CONFIRMED')}
                        className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Confirmar Pedido
                    </button>
                    <button
                        disabled={isPending}
                        onClick={() => handleUpdate('CANCELED')}
                        className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition disabled:opacity-50"
                    >
                        <XCircle className="w-5 h-5" />
                        Cancelar Pedido
                    </button>
                </>
            )}

            {/* CONFIRMED Flow */}
            {currentStatus === 'CONFIRMED' && (
                <button
                    disabled={isPending}
                    onClick={() => handleUpdate('ORDERED_TO_BRAND')}
                    className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                    <Package className="w-5 h-5" />
                    Ya pedí a la Marca
                </button>
            )}

            {/* FULFILLMENT Flow */}
            {currentStatus === 'ORDERED_TO_BRAND' && (
                <button
                    disabled={isPending}
                    onClick={() => handleUpdate('IN_TRANSIT')}
                    className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                    <Truck className="w-5 h-5" />
                    Ya me llegó (En Camino al Cliente)
                </button>
            )}

            {currentStatus === 'IN_TRANSIT' && (
                <button
                    disabled={isPending}
                    onClick={() => handleUpdate('DELIVERED')}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                    <CheckCircle className="w-5 h-5" />
                    Entregado al Cliente
                </button>
            )}

        </div>
    );
}
