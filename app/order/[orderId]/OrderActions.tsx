'use client';

import { markOrderAsSent } from '@/app/actions';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

interface OrderActionsProps {
    orderId: string;
    whatsappUrl: string;
}

export function OrderActions({ orderId, whatsappUrl }: OrderActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleSend = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default link behavior initially if wrapped?

        startTransition(async () => {
            // 1. Mark as sent in DB
            await markOrderAsSent(orderId);

            // 2. Open WhatsApp
            window.open(whatsappUrl, '_blank');
        });
    };

    return (
        <button
            onClick={handleSend}
            disabled={isPending}
            className="w-full bg-[#25D366] text-white font-bold py-3 rounded-md hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-sm"
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
            Confirmar y Enviar por WhatsApp
        </button>
    );
}
