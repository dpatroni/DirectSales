
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';

interface OrderSummary {
    id: string;
    clientName: string;
    total: string;
    status: string;
    date: Date;
}

interface RecentActivityProps {
    orders: OrderSummary[];
}

function getStatusBadge(status: string) {
    const s = status.toUpperCase();
    if (s === 'PENDING') return <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Pendiente</span>;
    if (s === 'CONFIRMED') return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Confirmado</span>;
    if (s === 'DELIVERED') return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Entregado</span>;
    if (s === 'CANCELED') return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Cancelado</span>;
    return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{s.substring(0, 8)}</span>;
}

export function RecentActivity({ orders }: RecentActivityProps) {
    if (orders.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm">Últimos Pedidos</h3>
                <Link href="/dashboard/orders" className="text-purple-600 text-xs font-bold hover:underline">
                    Ver todos
                </Link>
            </div>
            <div className="divide-y divide-gray-50">
                {orders.map((order) => (
                    <Link href={`/dashboard/orders/${order.id}`} key={order.id} className="block hover:bg-gray-50 transition">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{order.clientName}</p>
                                    <p className="text-xs text-gray-400">
                                        {format(new Date(order.date), "dd MMM", { locale: es })} • S/ {order.total}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                {getStatusBadge(order.status)}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
