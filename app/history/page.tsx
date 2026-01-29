import { getClientOrders } from '@/app/actions';
import { Header } from '@/components/layout/Header';
import Link from 'next/link';
import { ArrowRight, Package, Calendar, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export default async function HistoryPage() {
    // 1. Check Auth (Consultant Sales)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let orders: any[] = [];
    let isConsultantView = false;

    if (user) {
        const consultant = await prisma.consultant.findUnique({
            where: { authId: user.id },
        });

        if (consultant) {
            isConsultantView = true;
            // Fetch SALES (Orders where this consultant is the seller)
            orders = await prisma.order.findMany({
                where: { consultantId: consultant.id },
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true,
                    cycle: true
                }
            });
        }
    }

    // 2. Guest View (Client Purchases)
    if (!isConsultantView) {
        orders = await getClientOrders();
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Minimal Header for History */}
            {!isConsultantView && <Header />}
            {isConsultantView && (
                <div className="bg-white sticky top-0 z-10 border-b p-4 flex justify-between items-center shadow-sm">
                    <h1 className="font-bold text-lg text-primary">Panel de Ventas</h1>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Consultora</span>
                </div>
            )}

            <main className="container mx-auto px-4 py-8 max-w-lg">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    {isConsultantView ? <TrendingUp className="w-6 h-6 text-green-600" /> : <Package className="w-6 h-6 text-primary" />}
                    {isConsultantView ? 'Mis Ventas' : 'Mis Pedidos'}
                </h1>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-dashed border-gray-300 text-center">
                        <Package className="w-12 h-12 text-gray-300 mb-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                            {isConsultantView ? 'Aún no has realizado ventas' : 'Aún no tienes pedidos'}
                        </h3>
                        {!isConsultantView && (
                            <Link href="/" className="text-primary font-bold hover:underline mt-2 inline-block">
                                Ir al Catálogo
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/order/${order.id}`}
                                className="block bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition"
                            >
                                <div className="p-4 flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.status === 'SENT' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.status === 'SENT' ? 'Enviado' : 'Pendiente'}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* If Consultant: Show CLIENT Name (or ID/Phone if no name captured, but we don't capture Client Name yet in Order model?
                                            Wait, Order model doesn't have Client Name field strictly in my memory.
                                            Let me check schema implies Order is anonymous or linked to User?
                                            Actually Order has 'clientName' if I recall correctly... I need to check schema.
                                            
                                            If Client View: Show Consultant Name.
                                        */}

                                        <p className="font-bold text-gray-900">
                                            {isConsultantView
                                                ? `Pedido #${order.id.slice(-4)}` // TODO: Add Client Name to Order Model
                                                : (order.consultant ? order.consultant.name : 'Natura')
                                            }
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Ciclo: {order.cycle?.name || 'Actual'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">S/ {Number(order.totalMoney).toFixed(2)}</p>
                                        <p className="text-xs text-emerald-600">💎 {order.totalPoints} pts</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-2 text-xs text-primary font-medium flex justify-between items-center">
                                    Ver Detalle
                                    <ArrowRight className="w-3 h-3" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
