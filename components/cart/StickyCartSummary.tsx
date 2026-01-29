import { getCartSummary } from '@/app/actions';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export async function StickyCartSummary() {
    const summary = await getCartSummary();

    if (!summary || summary.itemCount === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-lg z-40 md:hidden">
            <div className="flex items-center justify-between container mx-auto">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">{summary.itemCount} items</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">S/ {summary.totalMoney.toFixed(2)}</span>
                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            💎 {summary.totalPoints} pts
                        </span>
                    </div>
                </div>

                <Link
                    href="/cart" // We'll implement this page or modal later
                    className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:bg-orange-600 transition flex items-center gap-2"
                >
                    <ShoppingBag className="w-4 h-4" />
                    Ver Pedido
                </Link>
            </div>
        </div>
    );
}
