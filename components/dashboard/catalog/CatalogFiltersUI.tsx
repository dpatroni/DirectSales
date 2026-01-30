'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type FilterProps = {
    brands: { id: string, name: string }[];
    categories: { id: string, name: string }[];
    activeFilters: {
        query?: string;
        brandId?: string;
        categoryId?: string;
        isPromo?: boolean;
    };
};

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export function CatalogFiltersUI({ brands, categories, activeFilters }: FilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === null) {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleFilter = (type: 'brand' | 'cat' | 'promo', value: string | null) => {
        // Toggle logic: If clicking active filter, remove it.
        let nextValue = value;
        if (type === 'brand' && activeFilters.brandId === value) nextValue = null;
        if (type === 'cat' && activeFilters.categoryId === value) nextValue = null;
        if (type === 'promo') {
            // Toggle promo boolean
            nextValue = activeFilters.isPromo ? null : 'true';
        }

        router.push(`/dashboard/catalog?${createQueryString(type, nextValue)}`);
    };

    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {/* Reset / All */}
            <button
                onClick={() => router.push('/dashboard/catalog')}
                className={cn(
                    "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-transparent",
                    !activeFilters.brandId && !activeFilters.categoryId && !activeFilters.isPromo
                        ? "bg-natura-orange text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
            >
                Todos
            </button>

            {/* Promo Toggle */}
            <button
                onClick={() => handleFilter('promo', 'true')}
                className={cn(
                    "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    activeFilters.isPromo
                        ? "bg-natura-orange text-white border-natura-orange"
                        : "border-natura-orange text-natura-orange hover:bg-natura-orange/10"
                )}
            >
                Promociones
            </button>

            {/* Brands */}
            {brands.map(brand => (
                <button
                    key={brand.id}
                    onClick={() => handleFilter('brand', brand.id)}
                    className={cn(
                        "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-transparent",
                        activeFilters.brandId === brand.id
                            ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                >
                    {brand.name}
                </button>
            ))}

            {/* Categories (Optional, styling matching brands) */}
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => handleFilter('cat', cat.id)}
                    className={cn(
                        "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-transparent",
                        activeFilters.categoryId === cat.id
                            ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}
