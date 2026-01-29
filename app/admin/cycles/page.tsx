import prisma from '@/lib/prisma';
import { toggleCycleStatus } from '@/app/admin/actions';
import { CheckCircle, XCircle, Calendar, AlertTriangle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function CyclesPage() {
    const cycles = await prisma.cycle.findMany({
        orderBy: { startDate: 'desc' },
        include: { _count: { select: { orders: true, productPrices: true } } }
    });

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Ciclos</h1>

            <div className="grid gap-4">
                {cycles.map((cycle) => (
                    <div key={cycle.id} className={`bg-white p-6 rounded-lg shadow-sm border ${cycle.isActive ? 'border-green-500 ring-1 ring-green-100' : 'border-gray-100'} transition`}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${cycle.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        {cycle.name}
                                        {cycle.isActive && <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full uppercase">Activo</span>}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right text-sm">
                                    <p><span className="font-bold">{cycle._count.productPrices}</span> precios</p>
                                    <p><span className="font-bold">{cycle._count.orders}</span> pedidos</p>
                                </div>

                                <form action={async () => {
                                    'use server';
                                    await toggleCycleStatus(cycle.id, !cycle.isActive);
                                }}>
                                    <button
                                        type="submit"
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${cycle.isActive
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            }`}
                                    >
                                        {cycle.isActive ? (
                                            <>
                                                <XCircle className="w-4 h-4" /> Desactivar
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" /> Activar
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                ))}

                {cycles.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg border border-dashed text-gray-500">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                        <p>No se encontraron ciclos configurados en la base de datos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
