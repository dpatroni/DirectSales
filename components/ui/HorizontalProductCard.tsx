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
            <div className="group bg-white dark:bg-gray-800 rounded-3xl p-4 flex gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100/50 dark:border-gray-700 transition-all duration-500 hover:-translate-y-1">
                {/* Image Section */}
                <div className="relative w-36 h-36 flex-shrink-0 overflow-hidden rounded-2xl bg-[#F8F9FA] dark:bg-gray-700 group-hover:scale-105 transition-transform duration-500">
                    {displayProduct.imageUrl ? (
                        <Image
                            src={displayProduct.imageUrl}
                            alt={displayProduct.name}
                            fill
                            className="object-cover mix-blend-multiply transition-opacity duration-300 group-hover:opacity-90"
                            sizes="144px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag className="w-8 h-8 opacity-10" />
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5">
                        {isPromo && (
                            <span className="bg-natura-orange text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg shadow-orange-500/30">
                                {discountPercent}% Dcto
                            </span>
                        )}
                        {displayProduct.isRefill && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg shadow-emerald-500/30">
                                Repuesto
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-grow flex flex-col justify-between py-0.5">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black text-natura-orange uppercase tracking-[0.2em]">
                                {displayProduct.brand?.name || 'Natura'}
                            </span>

                            {/* Points Badge */}
                            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[9px] font-black border border-emerald-100/50">
                                <span className="text-[10px]">💎</span> {displayProduct.points} <span className="text-[8px] opacity-70">PTS</span>
                            </div>
                        </div>

                        <h2 className="text-[15px] font-extrabold leading-tight text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-natura-orange transition-colors">
                            {displayProduct.name}
                        </h2>

                        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {displayProduct.description || 'Producto exclusivo de Natura'}
                        </p>

                        {/* Variant indicator */}
                        {hasVariants && (
                            <div className="mt-2 flex items-center gap-1.5">
                                <div className="flex -space-x-1.5">
                                    {variants.slice(0, 3).map((v, i) => (
                                        <div
                                            key={i}
                                            className="size-3.5 rounded-full border-2 border-white ring-1 ring-gray-100"
                                            style={{ backgroundColor: v.color || '#ccc' }}
                                        />
                                    ))}
                                    {variants.length > 3 && (
                                        <div className="size-3.5 rounded-full bg-gray-100 flex items-center justify-center text-[7px] font-bold text-gray-500 border-2 border-white">
                                            +{variants.length - 3}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-orange-600">
                                    Tonos disponibles
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <div>
                            {isPromo && (
                                <span className="block text-[10px] font-bold text-gray-300 line-through leading-none mb-1">
                                    S/ {displayProduct.basePrice.toFixed(2)}
                                </span>
                            )}
                            <div className="text-xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
                                <span className="text-xs font-bold mr-0.5">S/</span>
                                {price.toFixed(2)}
                            </div>
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isPending}
                            className="group/btn relative overflow-hidden bg-natura-orange text-white h-11 px-5 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
                        >
                            <div className="flex items-center gap-2 relative z-10">
                                {isPending ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        {hasVariants ? 'Elegir' : 'Llevar'}
                                    </>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Refill Toggle (Optional - Below card if space permits, or inline) */}
            {hasRefillOption && (
                <div className="flex justify-end -mt-1 mb-3 px-2">
                    <button
                        onClick={() => setIsRefillView(!isRefillView)}
                        className="text-[10px] text-gray-500 underline decoration-dotted"
                    >
                        {isRefillView ? 'Ver producto original' : 'Ver opción de repuesto'}
                    </button>
                </div>
            )}
        </>
    );
}
