'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CheckoutButton() {
    return (
        <Link
            href="/checkout"
            className="w-full bg-primary text-white font-bold py-3 rounded-md shadow-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 text-lg"
        >
            Ir a Pagar
            <ArrowRight className="w-5 h-5" />
        </Link>
    );
}
