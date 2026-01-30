
import prisma from '@/lib/prisma';
import { Search, UserPlus, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    // 1. Get Logged In Consultant
    const SLUG = 'daniel-patroni'; // MVP Hardcode
    const consultant = await prisma.consultant.findUnique({ where: { slug: SLUG } });

    if (!consultant) return redirect('/');

    // 2. Fetch Customers
    const customers = await prisma.customer.findMany({
        where: { consultantId: consultant.id },
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: {
                select: { orders: true }
            }
        }
    });

    return (
        <div className="bg-[#FDFCFD] dark:bg-[#112114] min-h-screen text-[#0e1b10] dark:text-white pb-24 font-sans">
            <div className="max-w-4xl mx-auto flex flex-col min-h-screen">

                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#FDFCFD]/80 dark:bg-[#112114]/80 backdrop-blur-md mb-6">
                    <div className="max-w-4xl mx-auto flex items-center p-4 justify-between border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mis Clientes</h1>
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-bold">
                                {customers.length}
                            </span>
                        </div>
                        <button className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition text-xs flex items-center gap-2 px-4">
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Nuevo Cliente</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-4 space-y-4">

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o teléfono..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {/* Customer List */}
                    <div className="grid gap-3">
                        {customers.map((c) => (
                            <div key={c.id} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">
                                        {c.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{c.fullName}</h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {c.phone}
                                            </span>
                                            {c.email && <span>• {c.email}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                        <ShoppingBag className="w-4 h-4" />
                                        {c._count.orders} Pedidos
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        Activo {format(new Date(c.updatedAt), 'dd MMM', { locale: es })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {customers.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <p>Aún no tienes clientes registrados.</p>
                                <p className="text-sm mt-2">Comparte tu catálogo para empezar a recibir pedidos.</p>
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
}
