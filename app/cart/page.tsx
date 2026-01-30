import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCartSummary } from '@/app/actions';
import Image from 'next/image';
import { ChevronLeft, Info, Verified, Trash, ShoppingBag, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { CheckoutActions } from '@/components/checkout/CheckoutActions';
import { CheckoutItem } from '@/components/checkout/CheckoutItem';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
    // 1. Get Cart Logic
    const cartSummary = await getCartSummary();

    if (!cartSummary || cartSummary.itemCount === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-500">
                <ShoppingBag className="w-16 h-16 opacity-20 mb-4" />
                <h2 className="text-xl font-bold text-gray-700">Tu carrito está vacío</h2>
                <Link href="/" className="mt-4 text-primary font-bold hover:underline">
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    // 2. Fetch Consultant for Header
    // We assume cart is linked to consultant. 
    // Usually getCartSummary uses cookie which implies existing cart.
    // If cart exists, it has consultantId.
    const cart = await prisma.cart.findUnique({
        where: { id: cartSummary.cartId },
        include: { consultant: true }
    });

    if (!cart?.consultant) {
        // Edge case: Cart exists but no consultant? Should not happen.
        return redirect('/');
    }

    const consultant = cart.consultant;

    // 3. Totals and Promotions logic (Server Side Check)
    // We can allow client updates to quantity, but initial render is server.
    // Logic from actions.ts getCartSummary handles cycle prices.

    // Promo Logic (Mockup based on HTML "First Purchase Discount")
    // For now, we don't have a robust "Discount Code" system.
    // I'll leave the promotional section visually matching the HTML "Active Promotions" 
    // but maybe tied to standard cycle discounts (already in price).
    // Or I can hardcode a "Welcome Discount" if isDraft or similar?
    // Let's stick to "Item Level Promotions" which are already applied.
    // The visual "Active Promotions" block from HTML is "First Purchase Discount".
    // I'll show it if there are specific conditions or just statically for "Wow" effect (if requested)
    // but better to be honest. I'll show "Promociones del Ciclo" if savings exist.

    const totalSavings = cartSummary.items.reduce((acc, item) => {
        const p = item.product;
        const cyclePrice = p?.cyclePrices.find(cp => cp.cycleId === cart.cycleId);
        if (cyclePrice && cyclePrice.isPromotional) {
            return acc + (Number(p?.price) - Number(cyclePrice.price)) * item.quantity;
        }
        return acc;
    }, 0);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-slate-900 dark:text-slate-100 pb-32">

            {/* Top AppBar */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                    <Link href={`/${consultant.slug}`} className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-300">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1 text-center">
                        <h2 className="text-lg font-bold leading-tight">Revisa tu Pedido</h2>
                    </div>
                    {/* Info Button (Optional) */}
                    <div className="flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-slate-700 dark:text-slate-300 opacity-0 pointer-events-none">
                        <Info className="w-5 h-5" />
                    </div>
                </div>
            </header>

            <main className="px-4 max-w-md mx-auto">
                {/* Seller Info */}
                <div className="py-6 flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-emerald-500/20">
                        {consultant.avatarUrl ? (
                            <Image
                                src={consultant.avatarUrl}
                                alt={consultant.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl">
                                {consultant.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <p className="text-xl font-bold leading-tight">{consultant.name}</p>
                        <div className="flex items-center gap-1">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">Consultora Natura</p>
                            <Verified className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Section: Items */}
                <div className="flex items-center justify-between pt-2 pb-4">
                    <h3 className="text-lg font-bold leading-tight">Tus Productos</h3>
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {cartSummary.itemCount} Items
                    </span>
                </div>

                <div className="space-y-3">
                    {/* Render Client Components for Items to allow Quantity Updates */}
                    {cartSummary.items.map((item) => (
                        <CheckoutItem key={item.id} item={item} cycleId={cart.cycleId} />
                    ))}
                </div>

                {/* Section: Promotions Summary (if savings exist) */}
                {totalSavings > 0 && (
                    <>
                        <h3 className="text-lg font-bold leading-tight pt-8 pb-4">Promociones Activas</h3>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300">
                                <span className="text-lg font-bold">%</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">Descuentos del Ciclo</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Aplicados a tus productos</p>
                            </div>
                            <div className="text-emerald-600 font-bold">- S/ {totalSavings.toFixed(2)}</div>
                        </div>
                    </>
                )}

                {/* Price Breakdown Component (Client Interaction) */}
                <CheckoutActions
                    cart={cartSummary}
                    consultantPhone={consultant.phone}
                    consultantName={consultant.name}
                    totalSavings={totalSavings}
                    consultantId={consultant.id}
                />

            </main>
        </div>
    );
}
