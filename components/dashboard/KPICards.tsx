import { Package, Tag } from 'lucide-react'

type KPIProps = {
    productCount: number
    productDiff: number
    activePromos: number
}

export function KPICards({ productCount, productDiff, activePromos }: KPIProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Productos</span>
                    <Package className="text-primary w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{productCount}</div>
                <div className="text-[10px] text-green-500 font-medium mt-1">+{productDiff} este ciclo</div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Promos</span>
                    <Tag className="text-secondary w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{activePromos}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Activas ahora</div>
            </div>
        </div>
    )
}
