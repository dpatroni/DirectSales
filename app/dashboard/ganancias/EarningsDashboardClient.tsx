
'use client';

import { useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Award, Grid, Trophy, ShoppingBag, Filter, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const dynamic = 'force-dynamic';

function KPICard({ title, value, subtext, icon: Icon, colorClass, borderClass }: any) {
    return (
        <div className={`bg-white dark:bg-white/5 p-5 rounded-2xl border ${borderClass} shadow-sm relative overflow-hidden flex flex-col justify-between h-full`}>
            <div className={`absolute top-0 right-0 p-3 opacity-10 ${colorClass}`}>
                <Icon className="w-16 h-16" />
            </div>
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                    {title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                </h3>
            </div>
            {subtext && (
                <p className="text-xs text-gray-400 mt-2">
                    {subtext}
                </p>
            )}
        </div>
    );
}

export default function EarningsDashboard({ data }: { data: any }) {
    const [filterBrand, setFilterBrand] = useState('ALL');

    const filteredCommissions = useMemo(() => {
        if (filterBrand === 'ALL') return data.commissions;
        return data.commissions.filter((c: any) => c.brand.name === filterBrand);
    }, [data.commissions, filterBrand]);

    return (
        <div className="bg-[#FDFCFD] dark:bg-[#112114] min-h-screen text-[#0e1b10] dark:text-white pb-24 font-sans">
            <div className="max-w-4xl mx-auto flex flex-col min-h-screen">

                {/* Header */}
                <header className="sticky top-0 z-50 bg-[#FDFCFD]/80 dark:bg-[#112114]/80 backdrop-blur-md mb-6">
                    <div className="max-w-4xl mx-auto flex items-center p-4 justify-between border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mis Ganancias</h1>
                                <p className="text-xs text-gray-500">Resumen financiero</p>
                            </div>
                        </div>
                        {/* Cycle Selector Placeholder */}
                        <div className="bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300">
                            Ciclo Actual
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 space-y-8">

                    {/* KPI Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* 1. Current Cycle Earnings (Main) */}
                        <div className="col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <DollarSign className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-emerald-100 font-medium text-sm mb-1 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Ganado este Ciclo
                                </p>
                                <h1 className="text-4xl font-bold tracking-tight mb-2">
                                    S/ {data.totalEarnings.toFixed(2)}
                                </h1>
                                <Link href="#details" className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full backdrop-blur-sm transition">
                                    Ver Detalle <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>

                        {/* 2. Historical Total */}
                        <KPICard
                            title="Acumulado Histórico"
                            value={`S/ ${data.historicalTotal.toFixed(2)}`}
                            icon={Award}
                            colorClass="text-blue-500"
                            borderClass="border-blue-100 dark:border-blue-900/30"
                        />

                        {/* 3. Orders Count */}
                        <KPICard
                            title="Pedidos Validados"
                            value={data.orderCount}
                            subtext="Generaron comisión"
                            icon={ShoppingBag}
                            colorClass="text-purple-500"
                            borderClass="border-purple-100 dark:border-purple-900/30"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Chart: Earnings by Brand */}
                        <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Grid className="w-5 h-5 text-gray-400" />
                                Por Marca
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: '#6B7280' }}
                                            dy={10}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F3F4F6' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Best Brand Card + Mini Table */}
                        <div className="space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-6">
                                <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full text-amber-600 dark:text-amber-400">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-amber-800 dark:text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
                                        Marca Estrella
                                    </p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {data.bestBrand.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        S/ {data.bestBrand.amount.toFixed(2)} generados
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div id="details" className="bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                Detalle de Comisiones
                            </h3>

                            {/* Filter */}
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/10 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select
                                    className="bg-transparent text-sm font-medium focus:outline-none dark:text-white"
                                    value={filterBrand}
                                    onChange={(e) => setFilterBrand(e.target.value)}
                                >
                                    <option value="ALL">Todas las marcas</option>
                                    {data.chartData.map((d: any) => (
                                        <option key={d.name} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4">Pedido</th>
                                        <th className="px-6 py-4">Marca</th>
                                        <th className="px-6 py-4 text-center">Tasa</th>
                                        <th className="px-6 py-4 text-right">Comisión</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filteredCommissions.map((c: any) => (
                                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                            <td className="px-6 py-4 text-gray-500">
                                                {format(new Date(c.createdAt), 'dd MMM', { locale: es })}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                ...{c.orderId.slice(-4)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold">
                                                    {c.brand.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-500">
                                                {(Number(c.commissionRate) * 100).toFixed(0)}%
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                + S/ {Number(c.commissionAmount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCommissions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                No se encontraron comisiones con este filtro.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
