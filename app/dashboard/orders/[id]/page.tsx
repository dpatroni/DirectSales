
import prisma from '@/lib/prisma';
import { ArrowLeft, Phone, MapPin, Calendar, CreditCard, ChevronDown, CheckCircle, XCircle, Truck, Package, Send } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderStatusActions } from '@/components/orders/OrderStatusActions';

/* 
  Since we need interactivity for Status Updates, we will extract the Action Buttons 
  into a Client Component `OrderStatusActions`. The rest is Server Component.
*/

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            customer: true,
            items: {
                include: { product: true } // Simplified for view
            },
            cycle: true
        }
    });

    if (!order) return notFound();

    return (
        <div className="bg-[#FDFCFD] dark:bg-[#112114] min-h-screen pb-safe font-sans">

            {/* Header */}
            <header className="bg-white dark:bg-[#112114] border-b border-gray-100 dark:border-white/5 sticky top-0 z-50">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/dashboard/orders" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </Link>
                    <h1 className="font-bold text-lg text-gray-900 dark:text-white">Pedido #{order.id.slice(0, 8)}</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-4 space-y-6">

                {/* Status Card & Actions */}
                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Estado Actual</p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {order.status}
                        </div>
                    </div>

                    {/* Client Component for Actions */}
                    <OrderStatusActions orderId={order.id} currentStatus={order.status} />
                </div>

                {/* Customer Info */}
                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        Datos del Cliente
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Nombre</span>
                            <span className="font-medium text-gray-900">{order.customer?.fullName || order.clientName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">WhatsApp</span>
                            <Link href={`https://wa.me/51${order.clientPhone}`} target="_blank" className="font-medium text-green-600 hover:underline">
                                {order.customer?.phone || order.clientPhone}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        Productos ({order.items.length})
                    </h3>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0" /> {/* Placeholder image */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">{item.nameSnapshot}</p>
                                    <p className="text-xs text-gray-500">Cod: {item.product?.sku}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 text-sm">S/ {Number(item.finalPrice).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>S/ {Number(order.subtotal).toFixed(2)}</span>
                    </div>
                    {Number(order.discountTotal) > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Descuentos</span>
                            <span>- S/ {Number(order.discountTotal).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                        <span>Total a Cobrar</span>
                        <span>S/ {Number(order.total).toFixed(2)}</span>
                    </div>
                </div>

            </main>
        </div>
    );
}
