'use client';

import { useState, useTransition } from 'react';
import { toggleProductVisibility } from '@/app/actions/catalog';
import Image from 'next/image';
import Link from 'next/link';

type CatalogItemProps = {
    product: {
        id: string;
        name: string;
        sku: string;
        description: string | null;
        imageUrl: string | null;
        brand: string;
        isVisible: boolean;
        price: number;
        promotionalPrice: number | null;
        isPromotional: boolean;
    }
}

export function CatalogItem({ product }: CatalogItemProps) {
    const [isVisible, setIsVisible] = useState(product.isVisible);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newState = e.target.checked;
        setIsVisible(newState); // Optimistic update

        startTransition(async () => {
            try {
                await toggleProductVisibility(product.id, newState);
            } catch (error) {
                // Revert if failed
                setIsVisible(!newState);
                console.error('Failed to toggle visibility');
            }
        });
    };

    const currentPrice = product.promotionalPrice || product.price;
    const hasDiscount = !!product.promotionalPrice;

    // Calculate off percentage safely
    const discountPercent = hasDiscount && product.price > 0
        ? Math.round(((product.price - product.promotionalPrice!) / product.price) * 100)
        : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 flex gap-4 ios-shadow border border-gray-100 dark:border-gray-700 relative">
            {/* Click Area Container */}
            <Link href={`/dashboard/catalog/${product.sku}`} className="flex gap-4 flex-grow">
                <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-700">
                    <Image
                        alt={product.name}
                        className="w-full h-full object-cover"
                        src={product.imageUrl || "/placeholder.jpg"}
                        width={128}
                        height={128}
                        unoptimized
                    />
                    {hasDiscount && (
                        <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            {discountPercent}% OFF
                        </span>
                    )}
                </div>

                <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-semibold text-natura-orange uppercase tracking-widest">
                                {product.brand}
                            </span>
                            {/* Checkbox Placeholder to maintain layout space (actual checkbox is absolute) */}
                            <div className="w-9 h-5"></div>
                        </div>
                        <h2 className="text-base font-bold leading-tight mt-0.5 text-gray-900 dark:text-white">
                            {product.name}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {product.description || 'Sin descripción'}
                        </p>
                    </div>

                    <div className="flex items-end justify-between">
                        <div>
                            {hasDiscount && (
                                <span className="text-xs text-gray-400 line-through">S/ {product.price.toFixed(2)}</span>
                            )}
                            <div className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                S/ {currentPrice.toFixed(2)}
                            </div>
                        </div>

                        {hasDiscount && (
                            <button className="flex items-center gap-1 bg-natura-orange/10 text-natura-orange px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-natura-orange/20 transition-colors">
                                <span className="material-symbols-outlined text-sm">campaign</span> Promo
                            </button>
                        )}
                    </div>
                </div>
            </Link>

            {/* Visibility Toggle (Absolute to not interfere with Link) */}
            <div className="absolute top-3 right-3 z-10">
                <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isVisible}
                        onChange={handleToggle}
                        disabled={isPending}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                </label>
            </div>
        </div>
    );
}
