
import { DollarSign, TrendingUp, ShoppingBag, Users, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface KPIGridProps {
    sales: string;
    earnings: string;
    activeOrders: number;
    totalClients: number;
    newClients: number;
}

export function KPIGrid({ sales, earnings, activeOrders, totalClients, newClients }: KPIGridProps) {
    return (
        <div className="grid grid-cols-2 gap-4 mb-10">
            {/* Sales - Elite High Impact */}
            <div className="bg-black text-white p-8 rounded-[2.5rem] col-span-2 relative overflow-hidden shadow-2xl group transition-transform duration-500 hover:scale-[1.01]">
                {/* Elite Textures & Glows */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-transparent to-orange-500/10 opacity-50" />
                <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-purple-600/20 blur-[100px] animate-pulse" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-4 h-4 text-purple-400 fill-purple-400" />
                            <p className="text-purple-300 text-[9px] font-black uppercase tracking-[0.4em]">Ventas del Ciclo</p>
                        </div>
                        <h3 className="text-5xl font-black tracking-tighter lining-nums tabular-nums">S/ {sales}</h3>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/5 flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">+12% vs last</p>
                                <p className="text-sm font-black text-emerald-400">UP TREND</p>
                            </div>
                            <div className="bg-emerald-500/20 p-2 rounded-full">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings - Elite Glass */}
            <div className="elite-glass p-6 rounded-[2rem] flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-500/10 p-2.5 rounded-2xl text-emerald-600">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em]">Ganancia</p>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-950 tracking-tighter">S/ {earnings}</h3>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Estimada</p>
                </div>
            </div>

            {/* Orders - Elite Glass */}
            <div className="elite-glass p-6 rounded-[2rem] flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-natura-orange/10 p-2.5 rounded-2xl text-natura-orange">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em]">Pedidos</p>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-950 tracking-tighter">{activeOrders}</h3>
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1">Activos</p>
                </div>
            </div>

            {/* Clients - Elite Wide */}
            <div className="elite-glass p-8 rounded-[2.5rem] col-span-2 flex flex-col sm:flex-row items-center justify-between gap-8 group hover:-translate-y-2 transition-all duration-500">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-500/10 p-2.5 rounded-2xl text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.4em]">Mis Clientes</p>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <h3 className="text-4xl font-black text-gray-950 tracking-tighter">{totalClients}</h3>
                        {newClients > 0 && <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">+{newClients} New</span>}
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-3">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full bg-white border-4 border-gray-50 flex items-center justify-center text-xs text-gray-400 font-black shadow-lg">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                        {totalClients > 4 && (
                            <div className="w-12 h-12 rounded-full bg-black border-4 border-gray-900 flex items-center justify-center text-[10px] text-white font-black shadow-lg">
                                +{totalClients - 4}
                            </div>
                        )}
                    </div>
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">Direct Connection</span>
                </div>
            </div>
        </div>
    );
}
