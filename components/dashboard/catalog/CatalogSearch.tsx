'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce'; // Assuming hook exists, if not will implement inline or create hook

export function CatalogSearch({ initialQuery }: { initialQuery?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(initialQuery || '');

    // Debounce to prevent rapid URL updates
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), 500);
        return () => clearTimeout(timer);
    }, [value]);

    useEffect(() => {
        const createQueryString = (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (!value) {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            return params.toString();
        };

        // Only push if value differs from URL param to avoid loops/redundant pushes
        const currentQ = searchParams.get('q') || '';
        if (debouncedValue !== currentQ) {
            router.push(`/dashboard/catalog?${createQueryString('q', debouncedValue)}`);
        }
    }, [debouncedValue, router, searchParams]);


    return (
        <>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-natura-orange/50 text-sm text-gray-900 dark:text-white placeholder-gray-500"
                placeholder="Buscar perfume, labial..."
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </>
    );
}
