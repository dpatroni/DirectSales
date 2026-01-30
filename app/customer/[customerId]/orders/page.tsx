
import { getCustomerOrders, verifyCustomerAccess } from '@/app/actions/customer-portal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronRight, ShoppingBag, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string) {
    const s = status.toUpperCase();
    if (s === 'PENDING') return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</span>;
    if (s === 'CONFIRMED') return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Confirmado</span>;
    if (s === 'IN_TRANSIT') return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><Truck className="w-3 h-3" /> En Camino</span>;
    if (s === 'DELIVERED') return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Entregado</span>;
    if (s === 'CANCELED') return <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelado</span>;
    return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">{s}</span>;
}

export default async function CustomerOrdersPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = await params;
    const customer = await verifyCustomerAccess(customerId);
    if (!customer) return notFound();

    const orders = await getCustomerOrders(customerId);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Minimal Header */}
            <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-600 text-white p-2 rounded-lg">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Hola</p>
                    <p className="text-sm font-bold text-gray-800">{customer.fullName.split(' ')[0]}</p>
                </div>
            </header>

            <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-4">
                <h1 className="text-xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-800 font-medium mb-1">Aún no tienes pedidos</h3>
                        <p className="text-sm text-gray-500">¡Explora el catálogo y haz tu primer pedido!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <Link href={`/customer/${customerId}/orders/${order.id}`} key={order.id} className="block">
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-transparent hover:border-purple-100 active:scale-[0.99] transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-xs text-gray-400 mb-0.5">
                                                {format(new Date(order.createdAt), "d 'de' MMMM", { locale: es })}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">Pedido #{order.id.slice(0, 5)}</span>
                                            </div>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                        <div className="text-sm text-gray-500">
                                            {order._count.items} {order._count.items === 1 ? 'producto' : 'productos'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">S/ {Number(order.total).toFixed(2)}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Mini Preview items */}
                                    <div className="mt-2 text-xs text-gray-400 truncate">
                                        {order.items.map(i => `${i.quantity}x ${i.nameSnapshot}`).join(', ')}
                                        {order._count.items > 3 && '...'}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
