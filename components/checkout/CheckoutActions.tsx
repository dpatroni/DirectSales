'use client';

import { useState } from 'react';
import { createOrderFromCart } from '@/app/actions/orders';

interface CheckoutActionsProps {
    cart: any; // cart summary
    consultantPhone: string | null;
    consultantName: string;
    totalSavings: number;
    consultantId?: string;
}

export function CheckoutActions({ cart, consultantPhone, consultantName, totalSavings, consultantId }: CheckoutActionsProps) {

    // Calculate total on client to match server, but simpler just reuse cart summary logic passed down
    // Actually, `cart` prop has `totalMoney` computed from server.
    // If quantity updates, server revalidates, so providing `cart` is updated.

    const subtotal = cart.totalMoney; // already includes promo prices?
    // Wait, getCartSummary logic sums (Price * Qty). Price is PROMO price if active.
    // So subtotal IS the final price.
    // To show "Savings", we need Base Price Total.
    // `totalSavings` passed from server is (Base - Promo).
    // So Real Subtotal (List Price) = Subtotal + Savings.

    const finalTotal = subtotal;
    const listPriceTotal = subtotal + totalSavings;

    const handleWhatsAppCheckout = async () => {
        if (!consultantPhone) {
            alert("El consultor no tiene teléfono registrado.");
            return;
        }

        // 1. Construct Message
        let message = `Hola ${consultantName}, quisiera realizar el siguiente pedido:\n\n`;

        cart.items.forEach((item: any) => {
            const p = item.product;
            const variant = item.selectedVariant ? ` (${item.selectedVariant.name})` : '';
            message += `▪️ ${item.quantity}x ${p.name}${variant}\n`;
        });

        message += `\n*Total: S/ ${finalTotal.toFixed(2)}*`;

        if (totalSavings > 0) {
            message += `\n(Ahorro total: S/ ${totalSavings.toFixed(2)})`;
        }

        // 2. Open WhatsApp
        const url = `https://wa.me/${consultantPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        // 3. Mark as Sent? Or just let it be.
        // User workflow: Send WA -> Consultant processes.
        // We could create an "Order" record here if we wanted history.
        // Let's create Order in background?
        // Maybe useful for "History".

        try {
            if (consultantId) {
                await createOrderFromCart(
                    consultantId,
                    cart.cartId,
                    { name: "Cliente WhatsApp", phone: consultantPhone || '' }
                );
            }
        } catch (e) {
            console.error("Failed to create order record", e);
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '' });

    // Use router for redirect
    const { push } = require('next/navigation').useRouter();

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleConfirmOrder = async () => {
        if (!formData.name || !formData.phone) {
            alert("Por favor completa tu nombre y teléfono");
            return;
        }

        setIsSubmitting(true);
        try {
            // We need consultantId and cartId. 
            // `cart` prop has `cartId` (from getCartSummary: { cartId: string, items: ... })
            // Wait, check cart summary type. Interface says `cart: any`. 
            // In `app/cart/page.tsx`, `cartSummary` is passed.
            // Let's assume `cart.cartId` exists from `getCartSummary`.

            const result = await createOrderFromCart(
                consultantId || (cart as any).consultantId, // Priority to prop
                cart.cartId,
                formData
            );

            if (result.success) {
                push(`/order/${result.orderId}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error al crear el pedido. Intenta nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Price Breakdown */}
            <div className="mt-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-3 mb-24">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span className="text-sm font-medium">Subtotal</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        S/ {listPriceTotal.toFixed(2)}
                    </span>
                </div>

                {totalSavings > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span className="text-sm font-medium">Descuentos</span>
                        <span className="text-sm font-bold text-emerald-600">
                            -S/ {totalSavings.toFixed(2)}
                        </span>
                    </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm font-medium">Envío</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">GRATIS</span>
                </div>
                <div className="flex justify-between pt-1">
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Total</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        S/ {finalTotal.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-50">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleOpenModal}
                        className="w-full bg-[#30e84f] hover:bg-opacity-90 active:scale-[0.98] transition-all h-14 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/20"
                    >
                        <span className="text-white font-bold text-lg">Confirmar Pedido</span>
                        <svg className="fill-white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.667.15-.198.301-.765.971-.937 1.171-.173.199-.344.225-.645.075-.3-.15-1.268-.467-2.414-1.49-.893-.797-1.495-1.782-1.67-2.083-.174-.3-.018-.462.132-.612.135-.135.3-.351.45-.526.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.667-1.611-.914-2.204-.24-.58-.485-.501-.667-.51l-.567-.01c-.198 0-.52.074-.792.372-.272.298-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                        </svg>
                    </button>
                    <div className="mt-2 text-center">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Checkout Seguro</p>
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Completa tus datos</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    placeholder="Tu nombre"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    placeholder="Tu celular (WhatsApp)"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmOrder}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                ) : 'Enviar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
