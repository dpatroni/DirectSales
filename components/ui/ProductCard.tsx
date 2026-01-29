'use client';

import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addToCart } from '@/app/actions';
import { ShoppingBag, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Toast } from './Toast';

// Helper for classes
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export type ProductWithPrice = {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    basePrice: number; // Decimal converted to number for UI
    points: number;
    isRefill: boolean;
    imageUrl?: string | null;
    promotionalPrice?: number | null; // From CycleProductPrice

    // Relations
    refillProduct?: ProductWithPrice | null; // If this is regular, it might have a refill
    parentProduct?: ProductWithPrice | null; // If this is refill, it has a parent
};

interface ProductCardProps {
    product: ProductWithPrice;
    consultantId: string; // Needed for addToCart
}

export function ProductCard({ product, consultantId }: ProductCardProps) {
    // Determine if we are showing the main product or its alternative (refill/parent)
    // We start with the passed product, but if it has a refill, we might want to toggle.
    const [isRefillView, setIsRefillView] = useState(product.isRefill);
    const [isPending, startTransition] = useTransition();

    // If the passed product IS a refill, the "main" view is actually the Refill view.
    // But usually we list the Regular product and toggle to Refill.

    // Let's resolve what "Regular" and what "Refill" object we have.
    const regularVersion = product.isRefill ? product.parentProduct : product;
    const refillVersion = product.isRefill ? product : product.refillProduct;

    const hasRefillOption = !!refillVersion;

    // Current product to display based on toggle
    const displayProduct = isRefillView && refillVersion ? refillVersion : regularVersion;

    if (!displayProduct) return null; // Should not happen if data is correct

    const price = displayProduct.promotionalPrice ?? displayProduct.basePrice;
    const isPromo = !!displayProduct.promotionalPrice;
    const discountPercent = isPromo
        ? Math.round(((displayProduct.basePrice - price) / displayProduct.basePrice) * 100)
        : 0;

    const [showToast, setShowToast] = useState(false);

    const handleAddToCart = () => {
        startTransition(async () => {
            const result = await addToCart(consultantId, displayProduct.id, 1);
            if (result.success) {
                setShowToast(true);
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

            <div className="flex flex-col rounded-lg border bg-white shadow-sm overflow-hidden relative">
                {/* Loading Overlay */}
                {isPending && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}

                {/* Product Image */}
                <div className="aspect-square w-full bg-gray-100 relative group">
                    {displayProduct.imageUrl ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={displayProduct.imageUrl}
                                alt={displayProduct.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                            <ShoppingBag className="w-12 h-12 opacity-20" />
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {isPromo && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                -{discountPercent}%
                            </span>
                        )}
                        {displayProduct.isRefill && (
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                                Repuesto
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
                        {displayProduct.name}
                    </h3>

                    {/* Points & Price */}
                    <div className="mt-3 flex items-end justify-between">
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900">
                                S/ {price.toFixed(2)}
                            </span>
                            {isPromo && (
                                <span className="text-xs text-gray-400 line-through">
                                    S/ {displayProduct.basePrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1 mb-1">
                            💎 {displayProduct.points} pts
                        </span>
                    </div>

                    {/* Toggle Refill */}
                    {hasRefillOption && (
                        <div className="mt-4 flex items-center gap-2 p-1 bg-gray-100 rounded-full w-fit">
                            <button
                                onClick={() => setIsRefillView(false)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                                    !isRefillView ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                Producto
                            </button>
                            <button
                                onClick={() => setIsRefillView(true)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                                    isRefillView ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                Repuesto
                            </button>
                        </div>
                    )}

                    {/* Add to Cart button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isPending}
                        className="mt-4 w-full bg-primary text-white text-sm font-bold py-2 rounded-md hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
                    >
                        {isPending ? 'Agregando...' : (
                            <>
                                <ShoppingBag className="w-4 h-4" />
                                Agregar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
