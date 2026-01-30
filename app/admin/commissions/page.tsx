
import prisma from '@/lib/prisma';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export default async function AdminCommissionsPage() {
    const commissions = await prisma.commission.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            consultant: true,
            order: true,
            brand: true,
            cycle: true
        }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Comisiones</h1>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                    Total Registros: {commissions.length}
                </span>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por consultora, marca..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Consultora</th>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Marca</th>
                                <th className="px-6 py-4 text-right">Venta Real</th>
                                <th className="px-6 py-4 text-center">Tasa %</th>
                                <th className="px-6 py-4 text-right">Comisión</th>
                                <th className="px-6 py-4">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {commissions.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500">
                                        {format(new Date(c.createdAt), 'dd MMM yyyy', { locale: es })}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <Link href={`/admin/consultants/${c.consultantId}`} className="hover:underline hover:text-primary">
                                            {c.consultant.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                        ...{c.orderId.slice(-6)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
                                            {c.brand.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        S/ {Number(c.grossAmount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-500">
                                        {(Number(c.commissionRate) * 100).toFixed(0)}%
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                        S/ {Number(c.commissionAmount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {c.status === 'VALID' ? (
                                            <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">Válida</span>
                                        ) : (
                                            <span className="text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold">{c.status}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {commissions.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                        No hay comisiones registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
