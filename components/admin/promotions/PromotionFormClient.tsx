'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { upsertPromotion, deletePromotion, PromotionInput } from '@/app/actions/admin-promotions';
import { DiscountType } from '@prisma/client';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { format } from 'date-fns';

type Props = {
    promotion?: any; // Using any to avoid complex Prisma include types on client for now, strictly typying later
    cycles: { id: string, name: string, isActive: boolean }[];
    products: { id: string, name: string, sku: string, imageUrl: string | null }[];
};

export default function PromotionFormClient({ promotion, cycles, products }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Form State
    const [name, setName] = useState(promotion?.name || '');
    const [discountType, setDiscountType] = useState<DiscountType>(promotion?.discountType || 'PERCENTAGE');
    const [discountValue, setDiscountValue] = useState(promotion?.discountValue ? Number(promotion?.discountValue) : 0);
    const [cycleId, setCycleId] = useState(promotion?.cycleId || (cycles.find(c => c.isActive)?.id || ''));
    const [startDate, setStartDate] = useState(promotion?.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '');
    const [endDate, setEndDate] = useState(promotion?.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '');
    const [isActive, setIsActive] = useState(promotion?.isActive ?? true);

    // Product Selection State
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
        promotion?.products?.map((p: any) => p.productId) || []
    );
    const [productSearch, setProductSearch] = useState('');
    const debouncedSearch = useDebounce(productSearch, 300);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data: PromotionInput = {
            id: promotion?.id,
            name,
            discountType,
            discountValue,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            cycleId,
            isActive,
            productIds: selectedProductIds
        };

        startTransition(async () => {
            const res = await upsertPromotion(data);
            if (res.success) {
                router.push('/admin/promotions');
            } else {
                alert('Error al guardar: ' + res.error);
            }
        });
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;
        startTransition(async () => {
            await deletePromotion(promotion.id);
            router.push('/admin/promotions');
        });
    };

    const toggleProduct = (id: string) => {
        if (selectedProductIds.includes(id)) {
            setSelectedProductIds(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedProductIds(prev => [...prev, id]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    {promotion ? 'Editar Promoción' : 'Nueva Promoción'}
                </h1>
                <div className="flex gap-2">
                    {promotion && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                            Eliminar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => router.push('/admin/promotions')}
                        disabled={isPending}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2 bg-natura-orange text-white rounded-lg hover:bg-orange-600 shadow-sm disabled:opacity-50 transition font-medium"
                    >
                        {isPending ? 'Guardando...' : 'Guardar Promoción'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="font-bold text-gray-900">Detalles Básicos</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-natura-orange/20 focus:border-natura-orange outline-none transition"
                                placeholder="Ej. Oferta Kaiak"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo</label>
                            <div className="relative">
                                <select
                                    value={cycleId}
                                    onChange={e => setCycleId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-natura-orange/20"
                                >
                                    <option value="" disabled>Seleccionar Ciclo</option>
                                    {cycles.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} {c.isActive ? '(Activo)' : ''}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Dscto</label>
                                <select
                                    value={discountType}
                                    onChange={e => setDiscountType(e.target.value as DiscountType)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                                >
                                    <option value="PERCENTAGE">Porcentaje (%)</option>
                                    <option value="FIXED_PRICE">Precio Fijo (S/)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={discountValue}
                                    onChange={e => setDiscountValue(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={isActive}
                                onChange={e => setIsActive(e.target.checked)}
                                className="w-4 h-4 text-natura-orange rounded border-gray-300 focus:ring-natura-orange"
                            />
                            <label htmlFor="active" className="text-sm font-medium text-gray-700 select-none">Promoción Activa</label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Products */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                Productos Seleccionados
                                <span className="bg-natura-orange text-white text-xs px-2 py-0.5 rounded-full">
                                    {selectedProductIds.length}
                                </span>
                            </h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-natura-orange outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {filteredProducts.map(product => {
                                    const isSelected = selectedProductIds.includes(product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => toggleProduct(product.id)}
                                            className={`
                                                flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none
                                                ${isSelected
                                                    ? 'bg-orange-50 border-orange-200 ring-1 ring-natura-orange/30'
                                                    : 'bg-white border-gray-100 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                                                ${isSelected ? 'bg-natura-orange border-natura-orange text-white' : 'border-gray-300 bg-white'}
                                            `}>
                                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                            </div>

                                            {product.imageUrl && (
                                                <img src={product.imageUrl} alt="" className="w-10 h-10 object-cover rounded bg-gray-100" />
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isSelected ? 'text-natura-orange' : 'text-gray-900'}`}>
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full py-10 text-center text-gray-500">
                                        No se encontraron productos.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
