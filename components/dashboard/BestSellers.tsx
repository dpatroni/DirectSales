// import { DashboardData } from '@/app/actions/dashboard'

export function BestSellers({ products }: { products: any[] }) {
    if (products.length === 0) return null

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Más Vendidos</h2>
                <button className="text-xs font-bold text-primary">Ver todo</button>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                {products.map((product: any) => (
                    <div key={product.id} className="min-w-[140px] bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="relative mb-2">
                            <img
                                alt={product.name}
                                className="w-full aspect-square object-cover rounded-xl"
                                src={product.imageUrl}
                            />
                            {product.discountPercent && (
                                <span className="absolute top-2 right-2 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    -{product.discountPercent}%
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{product.name}</p>
                        <p className="text-[10px] text-slate-500 mb-1">{product.category}</p>
                        <p className="text-sm font-bold text-primary">S/ {product.price.toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
