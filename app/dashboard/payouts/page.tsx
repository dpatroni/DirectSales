
import prisma from '@/lib/prisma';
import { DollarSign, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { generatePayoutForCycle } from '@/app/actions/payouts';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PayoutsPage() {
    // 1. Get Consultant
    const SLUG = 'daniel-patroni'; // MVP Hardcode
    const consultant = await prisma.consultant.findUnique({ where: { slug: SLUG } });
    if (!consultant) return redirect('/');

    // 2. Fetch Payout History
    const payouts = await prisma.payout.findMany({
        where: { consultantId: consultant.id },
        orderBy: { createdAt: 'desc' },
        include: { cycle: true }
    });

    // 3. Calculate Pending Balance (Commissions valid, delivered, but not paid out)
    const pendingCommissions = await prisma.commission.findMany({
        where: {
            consultantId: consultant.id,
            status: 'VALID',
            payoutId: null,
            order: { status: 'DELIVERED' } // Strict rule
        }
    });

    const pendingAmount = pendingCommissions.reduce((acc, c) => acc + Number(c.commissionAmount), 0);

    // Check if we can generate a payout for the current active cycle?
    // Actually, usually payouts are for ENDED cycles, but for MVP flexibility, 
    // we allow generating payout for current cycle if amount > 0.
    const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });

    // Server Action Wrapper
    async function handleRequestPayout() {
        'use server';
        if (!activeCycle) return;
        await generatePayoutForCycle(consultant!.id, activeCycle.id);
    }

    return (
        <div className="bg-[#FDFCFD] dark:bg-[#112114] min-h-screen pb-24 font-sans">
            <div className="max-w-4xl mx-auto flex flex-col min-h-screen">

                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#FDFCFD]/80 dark:bg-[#112114]/80 backdrop-blur-md mb-6">
                    <div className="max-w-4xl mx-auto flex items-center p-4 justify-between border-b border-gray-100 dark:border-white/5">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-emerald-600" />
                            Mis Pagos
                        </h1>
                    </div>
                </header>

                <main className="flex-1 px-4 space-y-6">

                    {/* Pending Balance Card */}
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
                        <p className="opacity-90 text-sm font-medium mb-1">Disponible para Liquidar</p>
                        <h2 className="text-4xl font-bold mb-4">S/ {pendingAmount.toFixed(2)}</h2>

                        <div className="flex gap-2 items-center text-sm opacity-80 mb-6">
                            <CheckCircle className="w-4 h-4" />
                            <span>{pendingCommissions.length} comisiones de pedidos entregados.</span>
                        </div>

                        {pendingAmount > 0 && activeCycle ? (
                            <form action={handleRequestPayout}>
                                <button type="submit" className="bg-white text-emerald-800 font-bold py-3 px-6 rounded-xl w-full hover:bg-emerald-50 transition shadow-sm flex justify-center items-center gap-2">
                                    Solicitar Liquidación <ArrowRight className="w-4 h-4" />
                                </button>
                                <p className="text-[10px] text-center mt-2 opacity-70">
                                    Se generará el corte para el ciclo {activeCycle.name}
                                </p>
                            </form>
                        ) : (
                            <div className="bg-white/10 rounded-lg p-3 text-center text-sm">
                                {pendingAmount === 0 ? "No tienes saldo pendiente de cobro." : "No hay ciclo activo."}
                            </div>
                        )}
                    </div>

                    {/* History */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Historial de Pagos</h3>
                        <div className="space-y-3">
                            {payouts.map((payout) => (
                                <div key={payout.id} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${payout.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {payout.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                                            </span>
                                            <span className="text-gray-500 text-xs flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(payout.createdAt), 'dd MMM yyyy', { locale: es })}
                                            </span>
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-gray-200">
                                            Liquidación {payout.cycle.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-gray-900 dark:text-white text-lg">
                                            S/ {Number(payout.totalAmount).toFixed(2)}
                                        </span>
                                        {payout.paidAt && (
                                            <span className="text-[10px] text-green-600 flex items-center justify-end gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Pagado el {format(new Date(payout.paidAt), 'dd/MM', { locale: es })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {payouts.length === 0 && (
                                <p className="text-center text-gray-400 py-8 text-sm">Aún no tienes historial de pagos.</p>
                            )}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
