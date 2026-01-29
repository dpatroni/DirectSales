import prisma from '@/lib/prisma';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            brand: true
        }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Catálogo Global</h1>
                <Link href="/admin/products/new" className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </Link>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b">
                        <tr>
                            <th className="px-6 py-4">Producto</th>
                            <th className="px-6 py-4">SKU</th>
                            <th className="px-6 py-4">Marca</th>
                            <th className="px-6 py-4 text-right">Precio Base</th>
                            <th className="px-6 py-4 text-center">Puntos</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{product.name}</div>
                                    {product.isRefill && <span className="text-xs text-green-600 font-bold bg-green-50 px-1 rounded">Repuesto</span>}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">
                                    {product.sku}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                        {product.brand.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                    S/ {Number(product.price).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {product.points} pts
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
