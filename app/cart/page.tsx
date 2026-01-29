import { getCartSummary, updateItemQuantity, removeCartItem } from '@/app/actions';
import { Header } from '@/components/layout/Header';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, MessageCircle } from 'lucide-react';
import { CheckoutButton } from '@/components/cart/CheckoutButton';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma'; // Access prisma directly for consultant name lookup if needed, or stick to actions

export default async function CartPage() {
    const summary = await getCartSummary();

    if (!summary || summary.itemCount === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
                <p className="text-gray-500 mb-6 text-center">Agrega productos del catálogo para comenzar tu pedido.</p>
                <Link href="/" className="text-primary font-bold hover:underline">
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    // Need consultant info to construct the proper URL back and WA message
    // Assuming the first item's logic or using the cart's consultantId
    const cart = await prisma.cart.findUnique({
        where: { id: summary.cartId },
        include: { consultant: true, cycle: true }
    });

    if (!cart) redirect('/'); // Should not happen given summary exists

    const consultantName = cart.consultant.name;
    const consultantSlug = cart.consultant.slug;
    const cycleName = cart.cycle?.name || 'Ciclo Actual';

    // Construct WhatsApp Message
    const waItems = summary.items.map(item => {
        const p = item.product!;
        // Find active price logic again or assume passed summary logic for price calculation (simplified here for message)
        // Ideally we reuse the pure price calculation but for text string:
        const cyclePrice = p.cyclePrices.find(cp => cp.cycleId === cart.cycleId);
        const price = cyclePrice ? Number(cyclePrice.price) : Number(p.price);
        return `${item.quantity}x ${p.name} (S/ ${price.toFixed(2)})`;
    }).join('%0A'); // URL Encoded newline

    const waTotal = `Total: S/ ${summary.totalMoney.toFixed(2)}`;
    const waPoints = `Puntos: ${summary.totalPoints} pts`;

    const waText = `Hola ${consultantName}, este es mi pedido del ${cycleName}:%0A%0A${waItems}%0A%0A${waTotal}%0A${waPoints}`;
    const verifyUrl = `https://wa.me/?text=${waText}`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header consultantName={consultantName} />

            <main className="container mx-auto px-4 py-6 max-w-2xl">
                <div className="flex items-center gap-2 mb-6">
                    <Link href={`/${consultantSlug}`} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Tu Pedido</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
                    {summary.items.map((item) => {
                        const p = item.product!;
                        const cyclePrice = p.cyclePrices.find(cp => cp.cycleId === cart.cycleId);
                        const price = cyclePrice ? Number(cyclePrice.price) : Number(p.price);

                        return (
                            <div key={item.id} className="p-4 border-b last:border-0 flex gap-4">
                                {/* Simple Image Placeholder */}
                                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                    <ShoppingBag className="w-6 h-6 text-gray-300" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-900 mb-1">{p.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{p.isRefill ? 'Repuesto' : 'Regular'}</p>

                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-900">S/ {(price * item.quantity).toFixed(2)}</span>

                                        {/* Quantity Controls (Client Component usually needed, but for simplicity we can use forms/actions) */}
                                        {/* For MVP, we will assume user modifies in catalog or we construct simple forms here. 
                                    Since we didn't build client components for cart items specifically, let's keep it read-only for now 
                                    OR implement simple form buttons for +/-/recycle 
                                */}
                                        <div className="text-sm text-gray-600">Cant: {item.quantity}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Footer */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Total a pagar</span>
                        <span className="text-xl font-bold text-gray-900">S/ {summary.totalMoney.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-600">Puntos acumulados</span>
                        <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                            💎 {summary.totalPoints} pts
                        </span>
                    </div>

                    <CheckoutButton />
                </div>
            </main>
        </div>
    );
}
