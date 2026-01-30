
import prisma from '@/lib/prisma';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

function getStatusBadge(status: string) {
    const styles: any = {
        DRAFT: 'bg-gray-100 text-gray-600',
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        ORDERED_TO_BRAND: 'bg-purple-100 text-purple-800',
        IN_TRANSIT: 'bg-indigo-100 text-indigo-800',
        DELIVERED: 'bg-green-100 text-green-800',
        CANCELED: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${styles[status] || styles.DRAFT}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            consultant: true,
            customer: true,
            _count: { select: { items: true } }
        },
        take: 50
    });

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <Package className="w-6 h-6" />
                Gestión de Pedidos (Admin)
            </h1>

            <div className="bg-white dark:bg-[#112114] rounded-xl shadow border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Pedido ID</th>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Consultora</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                    {order.id.slice(0, 8)}...
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {order.consultant.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {order.customer?.fullName || order.clientName || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(order.status)}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                    S/ {Number(order.total).toFixed(2)}
                                </td>
                            </tr>
                        ))}

                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    No hay pedidos registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
