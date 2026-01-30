'use client';

import { Home, ShoppingBag, User, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Props to make it dynamic if needed, e.g. unread counts
export function BottomNav() {
    const pathname = usePathname();

    // We can't access cookies directly in Client Component easily without passing props.
    // However, for MVP, we can treat "Home" as "/" or try to read document.cookie if necessary, 
    // BUT simplest is just: if we are deeper, "/" is risky. 
    // Actually, `app/layout.tsx` is server side. Let's pass the slug to BottomNav if we can move BottomNav to be prop-driven?
    // User requested "Navigation Consolidation".
    // Better Approach: Use a Server Component wrapper or pass it from RootLayout.
    // Since RootLayout is server, let's modify RootLayout to fetch cookie and pass it.

    // For now, let's rely on the cookie exists. 
    // Client-side reading of httpOnly cookie is impossible.
    // Wait, createOrderFromCart used httpOnly? No, default is not httpOnly if not specified? 
    // The code I just wrote uses default settings. Cookies.set without httpOnly defaults to visible?
    // Let's check the code: cookies().set()... server side cookies are httpOnly by default in recent NextJs?

    // Alternative: Just use "/" and rely on Middleware to redirect "/" to "/consultant-slug" if cookie exists?
    // This is the CLEANEST way. 
    // If user goes to "/", Middleware checks 'consultant_slug' cookie -> Redirects.

    const homeLink = "/"; // Middleware handles redirection


    // Simple active check
    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

    // If we are in dashboard, do NOT show this nav (it has its own)
    if (isDashboard) return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe md:hidden">
            <div className="flex justify-around items-center h-16">
                <Link
                    href="/"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1",
                        isActive('/') ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Inicio</span>
                </Link>

                <Link
                    href="/cart"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1",
                        isActive('/cart') ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <ShoppingBag className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Carrito</span>
                </Link>

                <Link
                    href="/history"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1",
                        isActive('/history') ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Clock className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Historial</span>
                </Link>

                <Link
                    href="/profile"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1",
                        isActive('/profile') ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Perfil</span>
                </Link>
            </div>
        </nav>
    );
}
