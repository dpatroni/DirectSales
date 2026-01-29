import { Menu, Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
    consultantName?: string;
}

export function Header({ consultantName }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Menu className="h-6 w-6 text-gray-600 lg:hidden" />
                    <Link href="/" className="text-xl font-bold text-primary">
                        natura
                    </Link>
                </div>

                {consultantName && (
                    <div className="hidden text-sm font-medium text-gray-600 md:block">
                        Consultora: <span className="text-primary">{consultantName}</span>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <Search className="h-6 w-6 text-gray-600" />
                    <ShoppingBag className="h-6 w-6 text-gray-600" />
                </div>
            </div>
            {consultantName && (
                <div className="block border-t bg-gray-50 px-4 py-2 text-center text-xs text-gray-600 md:hidden">
                    Estás comprando con <span className="font-bold text-primary">{consultantName}</span>
                </div>
            )}
        </header>
    );
}
