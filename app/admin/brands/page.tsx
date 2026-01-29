import prisma from '@/lib/prisma';
import { BadgeCheck, Ban, CheckCircle2 } from 'lucide-react';
import { toggleBrandStatus } from './actions';

export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
    const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Marcas</h1>
                {/* Create button could go here */}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b">
                        <tr>
                            <th className="px-6 py-4">Marca</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4 text-center">Productos</th>
                            <th className="px-6 py-4 text-center">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {brands.map((brand) => (
                            <tr key={brand.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {brand.name}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">
                                    {brand.slug}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                                        {brand._count.products}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {brand.isActive ? (
                                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Activa
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs font-bold">
                                            <Ban className="w-3 h-3" />
                                            Inactiva
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <form action={toggleBrandStatus}>
                                        <input type="hidden" name="brandId" value={brand.id} />
                                        <input type="hidden" name="currentStatus" value={String(brand.isActive)} />
                                        <button className="text-primary hover:underline font-medium text-xs">
                                            {brand.isActive ? 'Desactivar' : 'Activar'}
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
