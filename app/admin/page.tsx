import prisma from '@/lib/prisma';
import { Users, TrendingUp, Package, Calendar } from 'lucide-react';

export default async function AdminDashboard() {
    // Determine current cycle
    const activeCycle = await prisma.cycle.findFirst({ where: { isActive: true } });

    // Stats
    const consultantCount = await prisma.consultant.count();
    const orderCount = await prisma.order.count();
    const cycleCount = await prisma.cycle.count();

    const stats = [
        { label: 'Consultoras', value: consultantCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pedidos Totales', value: orderCount, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Ciclo Activo', value: activeCycle?.name || 'Ninguno', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Ciclos Totales', value: cycleCount, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard General</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Bienvenido al Backoffice</h2>
                <p className="text-gray-600">
                    Desde aquí podrás gestionar todo el ecosistema de Natura DirectSales. Utiliza el menú lateral para navegar entre consultoras y ciclos.
                </p>
            </div>
        </div>
    );
}
