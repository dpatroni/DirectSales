'use server';

import { getAdminPromotions } from '@/app/actions/admin-promotions';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function AdminPromotionsPage() {
    const promotions = await getAdminPromotions();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Promociones</h1>
                    <p className="text-gray-500">Gestiona las campañas promocionales</p>
                </div>
                <Link
                    href="/admin/promotions/new"
                    className="bg-natura-orange text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-orange-600 transition"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Promoción
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Ciclo</th>
                            <th className="px-6 py-4">Descuento</th>
                            <th className="px-6 py-4">Vigencia</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {promotions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No hay promociones registradas.
                                </td>
                            </tr>
                        ) : (
                            promotions.map((promo) => (
                                <tr key={promo.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{promo.name}</div>
                                        <div className="text-xs text-gray-500">{promo._count.products} productos</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                            {promo.cycle.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {promo.discountType === 'PERCENTAGE'
                                            ? `${promo.discountValue}%`
                                            : `S/ ${Number(promo.discountValue).toFixed(2)}`}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {format(new Date(promo.startDate), 'dd MMM', { locale: es })} - {format(new Date(promo.endDate), 'dd MMM', { locale: es })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {promo.isActive ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/promotions/${promo.id}`}
                                            className="text-gray-400 hover:text-natura-orange transition p-2 inline-block"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
