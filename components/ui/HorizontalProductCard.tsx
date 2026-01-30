'use client';

import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addToCart } from '@/app/actions';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import Image from 'next/image';
import { Toast } from './Toast';
import { Modal } from './Modal';

// Helper
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Reuse/Extend the type from typical usage (defining locally for clarity in this new component)
export type ProductWithPrice = {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    basePrice: number;
    points: number;
    isRefill: boolean;
    imageUrl?: string | null;
    promotionalPrice?: number | null;
    brand?: { name: string } | null;
    category?: { name: string } | null;
    variants?: any; // JSON
    refillProduct?: ProductWithPrice | null;
    parentProduct?: ProductWithPrice | null;
};

interface ProductCardProps {
    product: ProductWithPrice;
    consultantId: string;
    consultantSlug: string;
}

export function HorizontalProductCard({ product, consultantId, consultantSlug }: ProductCardProps) {
    const [isPending, startTransition] = useTransition();
    const [showToast, setShowToast] = useState(false);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);

    // Determines active product (Regular vs Refill)
    // Horizontal card is simpler: Main is main. If refill exists, maybe show a small toggle or badge?
    // For now, let's stick to the "Main" product logic, assuming variants are on the main product.
    // If user toggles refill, we swap data.
    const [isRefillView, setIsRefillView] = useState(product.isRefill);

    // Resolve display product
    const regularVersion = product.isRefill ? product.parentProduct : product;
    const refillVersion = product.isRefill ? product : product.refillProduct;
    const hasRefillOption = !!refillVersion;

    const displayProduct = isRefillView && refillVersion ? refillVersion : regularVersion;

    if (!displayProduct) return null;

    const price = displayProduct.promotionalPrice ?? displayProduct.basePrice;
    const isPromo = !!displayProduct.promotionalPrice;
    const discountPercent = isPromo
        ? Math.round(((displayProduct.basePrice - price) / displayProduct.basePrice) * 100)
        : 0;

    const variants = displayProduct.variants as any[] || [];
    const hasVariants = variants.length > 0;

    const handleAddToCart = () => {
        // If has variants and none selected, open modal
        if (hasVariants && !selectedVariant) {
            setIsVariantModalOpen(true);
            return;
        }

        startTransition(async () => {
            // Pass the selected variant (entire object) to the action
            // The action expects just string? We might need to adjust action to accept JSON or just the name/sku
            // For now, let's pass the variant NAME + SKU as identifying string or update logic.
            // Our schema has `selectedVariant Json?`. So we can pass the object.

            // Note: addToCart signature in `app/actions` likely accepts (consultantId, productId, quantity, variant?)
            // I need to check `addToCart` signature. Assuming I need to update it.
            // For now, I'll pass it as is, and update `addToCart` next tool call.

            const variantData = selectedVariant ? selectedVariant : null;

            const result = await addToCart(consultantId, displayProduct.id, 1, variantData);
            if (result.success) {
                setShowToast(true);
                setIsVariantModalOpen(false); // close if open
                setSelectedVariant(null); // reset selection
            }
        });
    };

    return (
        <>
            <Toast
                message="Agregado al carrito"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />

            {/* Variant Selection Modal */}
            <Modal
                isOpen={isVariantModalOpen}
                onClose={() => setIsVariantModalOpen(false)}
                title={`Elige un tono para ${displayProduct.name}`}
            >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {variants.map((v, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedVariant(v)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                                selectedVariant?.sku === v.sku
                                    ? "border-primary bg-orange-50 ring-1 ring-primary"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <div
                                className="w-10 h-10 rounded-full shadow-inner border border-black/10"
                                style={{ backgroundColor: v.color || '#ccc' }}
                            />
                            <div className="text-center">
                                <span className="block text-xs font-bold text-gray-900">{v.name}</span>
                                <span className="block text-[10px] text-gray-500 leading-none mt-0.5">SKU: {v.sku}</span>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || isPending}
                        className="w-full bg-primary text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Agregando...' : 'Confirmar y Agregar'}
                    </button>
                </div>
            </Modal>


            {/* CARD */}
            <div className="group premium-card rounded-[2rem] p-5 flex flex-col sm:flex-row gap-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/5">
                {/* Image Section */}
                <div className="relative w-full sm:w-40 h-48 sm:h-40 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f8f8f8]">
                    {displayProduct.imageUrl ? (
                        <Image
                            src={displayProduct.imageUrl}
                            alt={displayProduct.name}
                            fill
                            className="object-contain p-2 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, 160px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                        {isPromo && (
                            <span className="bg-natura-orange text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-orange-500/30">
                                {discountPercent}% OFF
                            </span>
                        )}
                        {displayProduct.isRefill && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/30">
                                Repuesto
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-black text-natura-orange uppercase tracking-[0.2em] opacity-80">
                                {displayProduct.brand?.name || 'Natura'}
                            </span>

                            {/* Points Badge */}
                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100">
                                💎 {displayProduct.points} <span className="text-[8px] opacity-60">PTS</span>
                            </div>
                        </div>

                        <h2 className="text-lg font-black leading-[1.1] text-gray-900 line-clamp-2 transition-colors group-hover:text-natura-orange">
                            {displayProduct.name}
                        </h2>

                        <p className="text-xs font-medium text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                            {displayProduct.description || 'Producto exclusivo de Natura'}
                        </p>

                        {/* Variant indicator */}
                        {hasVariants && (
                            <div className="mt-3 flex items-center gap-2">
                                <div className="flex -space-x-1.5">
                                    {variants.slice(0, 4).map((v, i) => (
                                        <div
                                            key={i}
                                            className="size-4 rounded-full border-2 border-white ring-1 ring-gray-100 shadow-sm"
                                            style={{ backgroundColor: v.color || '#ccc' }}
                                        />
                                    ))}
                                    {variants.length > 4 && (
                                        <div className="size-4 rounded-full bg-gray-50 flex items-center justify-center text-[7px] font-black text-gray-500 border-2 border-white shadow-sm">
                                            +{variants.length - 4}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                                    {variants.length} Tonos
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-end justify-between mt-4">
                        <div>
                            {isPromo && (
                                <span className="block text-[10px] font-bold text-gray-300 line-through mb-1">
                                    S/ {displayProduct.basePrice.toFixed(2)}
                                </span>
                            )}
                            <div className="text-2xl font-black text-gray-950 tracking-tighter">
                                <span className="text-sm font-bold mr-0.5">S/</span>
                                {price.toFixed(2)}
                            </div>
                        </div>

                        {/* Add Button */}
                        <div className="relative group/btn-container">
                            <button
                                onClick={handleAddToCart}
                                disabled={isPending}
                                className="relative z-10 flex items-center gap-2 bg-gray-950 text-white h-12 px-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-natura-orange hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-gray-950/20 hover:shadow-orange-500/40"
                            >
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingBag className="w-4 h-4" />
                                        {hasVariants ? 'Elegir' : 'Llevar'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refill Toggle (Refined Toggle Label) */}
            {hasRefillOption && (
                <div className="flex justify-end mt-2 mb-6 px-4">
                    <button
                        onClick={() => setIsRefillView(!isRefillView)}
                        className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-natura-orange transition-colors"
                    >
                        <div className={cn(
                            "w-2 h-2 rounded-full border transition-all",
                            isRefillView ? "bg-natura-orange border-natura-orange" : "bg-transparent border-gray-300"
                        )} />
                        {isRefillView ? 'Ver Versión Original' : 'Ver Opción Repuesto'}
                    </button>
                </div>
            )}
        </>
    );
}
