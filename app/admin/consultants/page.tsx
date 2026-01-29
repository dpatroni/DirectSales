import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Search, Edit, ExternalLink } from 'lucide-react';

export default async function ConsultantsIndex() {
    const consultants = await prisma.consultant.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { orders: true }
            }
        }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Consultoras</h1>
                <Link href="/admin/consultants/new" className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-orange-600 transition">
                    <Plus className="w-5 h-5" />
                    Nueva Consultora
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Slug / Link</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">Ventas</th>
                                <th className="px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {consultants.map((consultant) => (
                                <tr key={consultant.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                {consultant.avatarUrl ? (
                                                    <img src={consultant.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                        {consultant.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{consultant.name}</p>
                                                <p className="text-xs text-gray-500">{consultant.email || 'Sin email'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/${consultant.slug}`} target="_blank" className="flex items-center gap-1 text-primary hover:underline">
                                            /{consultant.slug}
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        {consultant.authId ? (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Activa (Login)</span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">Pendiente</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono">
                                        {consultant._count.orders}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/consultants/${consultant.id}`} className="text-gray-400 hover:text-gray-900">
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {consultants.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        No se encontraron consultoras.
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
