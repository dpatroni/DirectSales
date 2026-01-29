import prisma from '@/lib/prisma';
import { createProduct } from '../actions';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default async function NewProductPage() {
    const brands = await prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/products" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 text-sm font-medium">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver al Catálogo
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Producto</h1>

            <form action={createProduct} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">

                {/* Brand Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                    <select name="brandId" required className="w-full border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary bg-white">
                        <option value="">Selecciona una marca...</option>
                        {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Solo se muestran marcas activas.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                        <input type="text" name="sku" required placeholder="Ej. NAT-123" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input type="text" name="name" required placeholder="Ej. Jabón Ekos" className="w-full border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea name="description" rows={3} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"></textarea>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base (S/) *</label>
                        <input type="number" name="price" step="0.10" required className="w-full border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Puntos *</label>
                        <input type="number" name="points" required className="w-full border rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
                    </div>
                    <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="isRefill" className="rounded text-primary focus:ring-primary" />
                            <span className="text-sm font-medium text-gray-700">Es Repuesto</span>
                        </label>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Guardar Producto
                    </button>
                </div>
            </form>
        </div>
    );
}
