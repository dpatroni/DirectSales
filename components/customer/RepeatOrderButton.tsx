
'use client';

import { repeatOrder } from '@/app/actions/reorder';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RepeatOrderButtonProps {
    customerId: string;
    orderId: string;
}

export default function RepeatOrderButton({ customerId, orderId }: RepeatOrderButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleReorder = async () => {
        const confirm = window.confirm("¿Deseas repetir este pedido? Esto reemplazará tu carrito actual con los productos disponibles de este pedido.");
        if (!confirm) return;

        setIsLoading(true);
        try {
            const result = await repeatOrder(customerId, orderId);

            if (result.success && result.cartId) {
                // Set cookie or local storage if needed?
                // Actually, the cart system usually relies on a cookie 'cartId'.
                // If the action created a NEW cart, we must tell the browser to use it.
                // Since this is a server action, sending a cookie back is tricky unless using 'cookies().set' in action.
                // The Action `repeatOrder` SHOULD set the cookie if it's creating a session cart.
                // BUT, `cookies()` is read-only in some next contexts or requires `cookies().set`.
                // Let's assume we pass `cartId` in URL or handle it.

                // Better approach: The action usually handles cookie setting if logic is there.
                // If not, we can force it via route handler or client logic.
                // MVP: Redirect to checkout with `?cartId=XYZ`. The checkout page logic should adopt it.

                if (result.message && result.warnings && result.warnings.length > 0) {
                    alert(result.message + "\n\n" + result.warnings.join("\n"));
                } else {
                    toast.success("Pedido copiado al carrito actual");
                }

                // Assuming standard cart page or checkout
                // We'll redirect to a client-facing 'view cart' page.
                // If we don't have a dedicated cart page URL yet, we use the checkout or store home.
                // Let's assume `/cart` or `/store?cartId=...`
                router.push(`/store?cartId=${result.cartId}`);
            } else {
                alert("Error: " + result.message);
            }
        } catch (e) {
            console.error(e);
            alert("Ocurrió un error inesperado.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleReorder}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:bg-purple-700 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
        >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            {isLoading ? 'Procesando...' : 'Repetir Pedido'}
        </button>
    );
}
