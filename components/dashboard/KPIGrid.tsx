
import { DollarSign, TrendingUp, ShoppingBag, Users } from 'lucide-react';

interface KPIGridProps {
    sales: string;
    earnings: string;
    activeOrders: number;
    totalClients: number;
    newClients: number;
}

export function KPIGrid({ sales, earnings, activeOrders, totalClients, newClients }: KPIGridProps) {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Sales */}
            <div className="bg-purple-600 text-white p-4 rounded-xl shadow-lg shadow-purple-200 col-span-2 flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-purple-100 text-xs font-medium uppercase tracking-wider mb-1">Ventas del Ciclo</p>
                    <h3 className="text-3xl font-bold">S/ {sales}</h3>
                </div>
                <div className="bg-white/20 p-3 rounded-full relative z-10">
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
                {/* Decoration */}
                <div className="absolute -right-6 -bottom-6 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
            </div>

            {/* Earnings */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-green-100 p-1.5 rounded-lg text-green-700">
                        <DollarSign className="w-4 h-4" />
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase">Ganancia</p>
                </div>
                <h3 className="text-xl font-bold text-gray-900">S/ {earnings}</h3>
                <p className="text-[10px] text-gray-400">Estimada este ciclo</p>
            </div>

            {/* Orders */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-100 p-1.5 rounded-lg text-blue-700">
                        <ShoppingBag className="w-4 h-4" />
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase">Pedidos</p>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{activeOrders}</h3>
                <p className="text-[10px] text-gray-400">Activos / En curso</p>
            </div>

            {/* Clients */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-2 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="bg-orange-100 p-1.5 rounded-lg text-orange-700">
                            <Users className="w-4 h-4" />
                        </div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Mis Clientes</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{totalClients}</h3>
                        {newClients > 0 && <span className="text-xs text-green-600 font-medium">+{newClients} nuevos</span>}
                    </div>
                </div>
                {/* Mini Graph Placeholder or Decoration */}
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">
                            {String.fromCharCode(64 + i)}
                        </div>
                    ))}
                    {totalClients > 3 && <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">+{totalClients - 3}</div>}
                </div>
            </div>
        </div>
    );
}
