'use client';

import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addToCart } from '@/app/actions';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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


            {/* ELITE CARD - Luxury Light Edition */}
            <div className="group relative bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-6 flex flex-col sm:flex-row gap-8 transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] border border-white/80">
                {/* Background Glow on Hover */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Image Section (45% on desktop) */}
                <Link
                    href={`/${consultantSlug}/products/${displayProduct.sku}`}
                    className="relative w-full sm:w-48 h-56 sm:h-48 flex-shrink-0 overflow-hidden rounded-[2rem] bg-white/80 transition-all duration-700 group-hover:bg-white shadow-sm border border-white/40 block"
                >
                    {displayProduct.imageUrl ? (
                        <Image
                            src={displayProduct.imageUrl}
                            alt={displayProduct.name}
                            fill
                            className="object-contain p-4 mix-blend-multiply transition-transform duration-1000 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, 192px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-100">
                            <ShoppingBag className="w-12 h-12" />
                        </div>
                    )}
                    {/* Elite Badges */}
                    <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                        {isPromo && (
                            <span className="bg-black text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                                {discountPercent}% OFF
                            </span>
                        )}
                        {displayProduct.isRefill && (
                            <span className="bg-emerald-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
                                Eco Repuesto
                            </span>
                        )}
                    </div>
                </Link>

                {/* Content Section (55% on desktop) */}
                <div className="relative z-10 flex-grow flex flex-col justify-between py-2">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-natura-orange" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                    {displayProduct.brand?.name || 'Natura'}
                                </span>
                            </div>

                            {/* Reward Points */}
                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.1em] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">
                                +{displayProduct.points} <span className="opacity-50">PTS</span>
                            </div>
                        </div>

                        <Link href={`/${consultantSlug}/products/${displayProduct.sku}`}>
                            <h2 className="text-2xl font-black leading-[1.1] text-gray-950 tracking-tighter transition-colors group-hover:text-natura-orange">
                                {displayProduct.name}
                            </h2>
                        </Link>

                        <p className="text-sm font-medium text-gray-600 mt-4 line-clamp-3 leading-relaxed max-w-[95%]">
                            {displayProduct.description || 'Diseño exclusivo natura para una experiencia de cuidado superior.'}
                        </p>

                        {/* Elite Variants display */}
                        {hasVariants && (
                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex -space-x-1.5">
                                    {variants.slice(0, 5).map((v, i) => (
                                        <div
                                            key={i}
                                            className="size-5 rounded-full border-2 border-white shadow-sm ring-1 ring-black/5"
                                            style={{ backgroundColor: v.color || '#eee' }}
                                        />
                                    ))}
                                    {variants.length > 5 && (
                                        <div className="size-5 rounded-full bg-black flex items-center justify-center text-[8px] font-black text-white border-2 border-white shadow-sm">
                                            +{variants.length - 5}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    {variants.length} tonos
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-end justify-between mt-8">
                        <div className="flex flex-col">
                            {isPromo && (
                                <span className="text-[11px] font-bold text-gray-300 line-through tracking-wider mb-0.5">
                                    S/ {displayProduct.basePrice.toFixed(2)}
                                </span>
                            )}
                            <div className="text-3xl font-black text-gray-950 tracking-tighter flex items-baseline">
                                <span className="text-sm font-bold mr-1">S/</span>
                                {price.toFixed(2)}
                            </div>
                        </div>

                        {/* Add Button - Luxury Boutique Style */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isPending}
                            className="group/btn relative h-12 px-6 rounded-2xl border-2 border-gray-950 bg-white/30 backdrop-blur-md text-gray-950 text-[10px] font-black uppercase tracking-[0.2em] overflow-hidden transition-all duration-300 hover:bg-gray-950 hover:text-white active:scale-95 shadow-sm"
                        >
                            <div className="relative z-10 flex items-center gap-3">
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>{hasVariants ? 'Elegir' : 'Llevar'}</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Refill / Original Toggle (Minimalist) */}
            {hasRefillOption && (
                <div className="flex justify-end mt-4 mb-10 px-6">
                    <button
                        onClick={() => setIsRefillView(!isRefillView)}
                        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-natura-orange transition-all"
                    >
                        <div className={cn(
                            "w-8 h-4 rounded-full border-2 transition-all relative flex items-center",
                            isRefillView ? "bg-natura-orange border-natura-orange" : "bg-transparent border-gray-200"
                        )}>
                            <div className={cn(
                                "size-2 rounded-full absolute transition-all",
                                isRefillView ? "right-1 bg-white" : "left-1 bg-gray-300"
                            )} />
                        </div>
                        {isRefillView ? 'Ver Original' : 'Eco Repuesto'}
                    </button>
                </div>
            )}
        </>
    );
}
