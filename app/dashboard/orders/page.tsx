
import prisma from '@/lib/prisma';
import { Search, Filter, ChevronRight, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

function getStatusColor(status: string) {
    switch (status) {
        case 'DRAFT': return 'bg-gray-100 text-gray-600';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700';
        case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
        case 'ORDERED_TO_BRAND': return 'bg-purple-100 text-purple-700';
        case 'IN_TRANSIT': return 'bg-indigo-100 text-indigo-700';
        case 'DELIVERED': return 'bg-green-100 text-green-700';
        case 'CANCELED': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-600';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'DRAFT': return 'Borrador';
        case 'PENDING': return 'Pendiente Confirmación';
        case 'CONFIRMED': return 'Confirmado';
        case 'ORDERED_TO_BRAND': return 'Pedido a Marca';
        case 'IN_TRANSIT': return 'En Camino';
        case 'DELIVERED': return 'Entregado';
        case 'CANCELED': return 'Cancelado';
        default: return status;
    }
}

export default async function OrdersPage() {
    // 1. Get Logged In Consultant (Mock)
    const SLUG = 'daniel-patroni';
    const consultant = await prisma.consultant.findUnique({ where: { slug: SLUG } });
    if (!consultant) return redirect('/');

    // 2. Fetch Orders
    const orders = await prisma.order.findMany({
        where: { consultantId: consultant.id },
        orderBy: { updatedAt: 'desc' },
        include: {
            customer: true,
            _count: { select: { items: true } }
        }
    });

    return (
        <div className="bg-[#FDFCFD] dark:bg-[#112114] min-h-screen text-[#0e1b10] dark:text-white pb-24 font-sans">
            <div className="max-w-4xl mx-auto flex flex-col min-h-screen">

                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#FDFCFD]/80 dark:bg-[#112114]/80 backdrop-blur-md mb-6">
                    <div className="max-w-4xl mx-auto flex items-center p-4 justify-between border-b border-gray-100 dark:border-white/5">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Package className="w-6 h-6 text-primary" />
                            Mis Pedidos
                        </h1>
                    </div>
                </header>

                <main className="flex-1 px-4 space-y-4">

                    {/* Filters (Simple UI for now) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['Todos', 'Pendientes', 'Confirmados', 'Entregados'].map((filter) => (
                            <button key={filter} className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium whitespace-nowrap hover:bg-gray-50 bg-white">
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Orders List */}
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <Link href={`/dashboard/orders/${order.id}`} key={order.id} className="block group">
                                <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-1 ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                {order.customer?.fullName || order.clientName || 'Cliente Invitado'}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-gray-900 dark:text-white">
                                                S/ {Number(order.total).toFixed(2)}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {order._count.items} items
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-3">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(order.updatedAt), "d MMM, h:mm a", { locale: es })}
                                        </span>
                                        <div className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                                            Ver detalle <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {orders.length === 0 && (
                            <div className="text-center py-20 text-gray-400">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No tienes pedidos registrados.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
