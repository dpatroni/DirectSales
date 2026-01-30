'use client';

import { Home, ShoppingBag, Send, Share2, ScanLine, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export function ConsultantBottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white/90 dark:bg-[#112114]/90 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 px-8 py-3 flex justify-between items-center z-50">
            {/* Home */}
            <Link
                href="/dashboard"
                className={cn(
                    "flex flex-col items-center gap-1",
                    isActive('/dashboard') ? "text-[#FF8DA1]" : "text-gray-400"
                )}
            >
                <Home className="w-7 h-7" />
                <span className="text-[10px] font-semibold">Inicio</span>
            </Link>

            {/* Orders */}
            <Link
                href="/dashboard/orders"
                className={cn(
                    "flex flex-col items-center gap-1",
                    isActive('/dashboard/orders') ? "text-[#FF8DA1]" : "text-gray-400"
                )}
            >
                <span className="material-symbols-outlined text-[26px]">receipt_long</span>
                {/* Fallback if material symbol font not loaded contextually, using Lucide equivalent */}
                <span className="text-[10px] font-bold">Pedidos</span>
            </Link>

            {/* Middle Action */}
            <div className="flex flex-col items-center -mt-10">
                <Link href="/dashboard/catalog" className="size-14 rounded-full bg-[#FF8DA1] flex items-center justify-center text-white shadow-lg border-4 border-[#FDFCFD] dark:border-[#112114]">
                    <span className="text-2xl font-light">+</span>
                </Link>
            </div>

            {/* Catalog */}
            <Link
                href="/dashboard/catalog"
                className={cn(
                    "flex flex-col items-center gap-1",
                    isActive('/dashboard/catalog') ? "text-[#FF8DA1]" : "text-gray-400"
                )}
            >
                <ShoppingBag className="w-7 h-7" />
                <span className="text-[10px] font-semibold">Catálogo</span>
            </Link>

            {/* Profile */}
            <Link
                href="/dashboard/profile"
                className={cn(
                    "flex flex-col items-center gap-1",
                    isActive('/dashboard/profile') ? "text-[#FF8DA1]" : "text-gray-400"
                )}
            >
                <span className="text-[26px]">👤</span>
                <span className="text-[10px] font-semibold">Perfil</span>
            </Link>
        </nav>
    );
}
