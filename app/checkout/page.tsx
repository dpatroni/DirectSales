import { getCartSummary } from '@/app/actions';
import { CheckoutReview } from '@/components/checkout/CheckoutReview';
import { Header } from '@/components/layout/Header';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getCurrentShoppingConsultant } from '@/app/actions';
import { getCustomerSession } from '@/app/actions/customer';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
    const summary = await getCartSummary();
    const consultant = await getCurrentShoppingConsultant();
    const customer = await getCustomerSession();

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <Header consultantName={consultant?.name} />

            <main className="container mx-auto px-4 py-6 max-w-lg">
                <Link href="/cart" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 text-sm font-medium">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver al Carrito
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Revisar Pedido</h1>
                <p className="text-gray-500 mb-6 text-sm">Verifica que todo esté correcto antes de enviar.</p>

                <p className="text-gray-500 mb-6 text-sm">Verifica que todo esté correcto antes de enviar.</p>

                <CheckoutReview summary={summary} customer={customer} consultantId={consultant?.id} />
            </main>
        </div>
    );
}
