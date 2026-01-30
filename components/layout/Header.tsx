import { Menu, Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
    consultantName?: string;
}

export function Header({ consultantName }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full transition-all duration-300">
            <div className="glass shadow-sm px-4">
                <div className="container mx-auto flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50 lg:hidden">
                            <Menu className="h-5 w-5 text-natura-orange" />
                        </div>
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-black tracking-tighter text-natura-orange">natura</span>
                            <div className="hidden h-4 w-[1px] bg-gray-200 md:block" />
                            <span className="hidden text-xs font-bold uppercase tracking-widest text-gray-400 md:block">Direct Sales</span>
                        </Link>
                    </div>

                    {consultantName && (
                        <div className="hidden items-center gap-2 rounded-full border border-orange-100 bg-orange-50/50 px-3 py-1 md:flex">
                            <div className="h-2 w-2 rounded-full bg-natura-orange animate-pulse" />
                            <span className="text-xs font-bold text-gray-700">
                                Consultora: <span className="text-natura-orange">{consultantName}</span>
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button className="flex size-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                            <Search className="h-5 w-5" />
                        </button>
                        <Link href="/cart" className="relative flex size-10 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-600 shadow-sm hover:scale-105 transition-all">
                            <ShoppingBag className="h-5 w-5" />
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-natura-orange text-[10px] font-bold text-white ring-2 ring-white">
                                0
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
            {consultantName && (
                <div className="flex items-center justify-center gap-2 border-b bg-white/50 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 backdrop-blur-md md:hidden">
                    <span className="text-natura-orange">●</span> Estás comprando con <span className="text-gray-900">{consultantName}</span>
                </div>
            )}
        </header>
    );
}
