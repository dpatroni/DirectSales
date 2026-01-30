
import prisma from '@/lib/prisma';
import { DollarSign, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { markPayoutAsPaid } from '@/app/actions/payouts';

export const dynamic = 'force-dynamic';

export default async function AdminPayoutsPage() {
    const payouts = await prisma.payout.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            consultant: true,
            cycle: true
        }
    });

    // Action Wrapper
    async function handleMarkPaid(formData: FormData) {
        'use server';
        const id = formData.get('payoutId') as string;
        if (id) await markPayoutAsPaid(id);
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Gestión de Pagos (Admin)
            </h1>

            <div className="bg-white dark:bg-[#112114] rounded-xl shadow border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Fecha Gen.</th>
                            <th className="px-6 py-4">Consultora</th>
                            <th className="px-6 py-4">Ciclo</th>
                            <th className="px-6 py-4">Monto</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {payouts.map((payout) => (
                            <tr key={payout.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                    {payout.id.slice(0, 8)}...
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {format(new Date(payout.createdAt), 'dd/MM/yyyy', { locale: es })}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {payout.consultant.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {payout.cycle.name}
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                    S/ {Number(payout.totalAmount).toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${payout.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {payout.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {payout.status === 'PENDING' ? (
                                        <form action={handleMarkPaid}>
                                            <input type="hidden" name="payoutId" value={payout.id} />
                                            <button type="submit" className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-800 transition">
                                                Marcar Pagado
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="flex items-center justify-end gap-1 text-green-600 font-medium text-xs">
                                            <CheckCircle className="w-3 h-3" /> Pagado
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
