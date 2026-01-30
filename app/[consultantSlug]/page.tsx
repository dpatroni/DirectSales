import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { HorizontalProductCard, ProductWithPrice } from '@/components/ui/HorizontalProductCard';
import { cookies } from 'next/headers';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface PageProps {
    params: Promise<{
        consultantSlug: string;
    }>;
    searchParams: Promise<{
        brand?: string;
    }>;
}

export const dynamic = 'force-dynamic';

export default async function CatalogPage({ params, searchParams }: PageProps) {
    const { consultantSlug } = await params;
    const { brand: brandSlug } = await searchParams;

    // 1. Fetch Consultant
    const consultant = await prisma.consultant.findUnique({
        where: { slug: consultantSlug },
    });

    if (!consultant) {
        notFound();
    }

    // 2. Fetch Active Cycle and Brands
    const [activeCycle, availableBrands] = await Promise.all([
        prisma.cycle.findFirst({ where: { isActive: true } }),
        prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
    ]);

    // 3. Helper for Brand Filter
    const brandFilter = brandSlug ? { slug: brandSlug } : undefined;

    // 4. Fetch Products
    const consultantProducts = await prisma.consultantProduct.findMany({
        where: {
            consultantId: consultant.id,
            isVisible: true,
            product: {
                isRefill: false,
                brand: brandFilter // Filter by Brand if provided
            },
        },
        include: {
            product: {
                include: {
                    brand: true, // Include brand info
                    cyclePrices: activeCycle ? {
                        where: { cycleId: activeCycle.id }
                    } : false,
                    refillProduct: {
                        include: {
                            cyclePrices: activeCycle ? {
                                where: { cycleId: activeCycle.id }
                            } : false,
                            consultantProducts: {
                                where: { consultantId: consultant.id, isVisible: true }
                            }
                        }
                    }
                }
            }
        }
    });

    // 5. Map to UI Model
    const products: ProductWithPrice[] = consultantProducts.map((cp) => {
        const p = cp.product;
        const mainPrice = p.cyclePrices[0];
        const basePrice = Number(p.price);
        const promotionalPrice = mainPrice?.isPromotional ? Number(mainPrice.price) : null;

        let refillVersion: ProductWithPrice | null = null;

        if (p.refillProduct && p.refillProduct.consultantProducts.length > 0) {
            const rp = p.refillProduct;
            const refPrice = rp.cyclePrices[0];
            const refBasePrice = Number(rp.price);
            const refPromotionalPrice = refPrice?.isPromotional ? Number(refPrice.price) : null;

            refillVersion = {
                id: rp.id,
                sku: rp.sku,
                name: rp.name,
                description: rp.description,
                basePrice: refBasePrice,
                points: rp.points,
                isRefill: true,
                promotionalPrice: refPromotionalPrice,
                imageUrl: rp.imageUrl,
                variants: rp.variants, // Map variants if refill has them
                brand: p.brand // Parent's brand
            };
        }

        return {
            id: p.id,
            sku: p.sku,
            name: p.name,
            description: p.description,
            basePrice,
            points: p.points,
            isRefill: false,
            imageUrl: p.imageUrl,
            promotionalPrice,
            refillProduct: refillVersion,
            brand: p.brand,
            variants: p.variants // Map variants
        };
    });

    return (
        <div className="min-h-screen bg-[#FDFCFD] mesh-gradient pb-24">
            <Header consultantName={consultant.name} />

            <main className="container mx-auto px-4 py-8 relative">
                {/* 1. Brand Filters (Premium Chips) */}
                <div className="no-scrollbar mb-12 flex snap-x items-center gap-3 overflow-x-auto pb-4 pt-1">
                    <a
                        href={`/${consultantSlug}`}
                        className={cn(
                            "flex snap-center items-center justify-center whitespace-nowrap px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                            !brandSlug
                                ? "bg-natura-orange text-white shadow-xl shadow-orange-500/20 scale-105"
                                : "bg-white/80 backdrop-blur-md text-gray-400 border border-gray-100 hover:border-orange-200 hover:text-orange-600 shadow-sm"
                        )}
                    >
                        Todas
                    </a>
                    {availableBrands.map(b => (
                        <a
                            key={b.id}
                            href={`/${consultantSlug}?brand=${b.slug}`}
                            className={cn(
                                "flex snap-center items-center justify-center whitespace-nowrap px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                                brandSlug === b.slug
                                    ? "bg-natura-orange text-white shadow-xl shadow-orange-500/20 scale-105"
                                    : "bg-white/80 backdrop-blur-md text-gray-400 border border-gray-100 hover:border-orange-200 hover:text-orange-600 shadow-sm"
                            )}
                        >
                            {b.name}
                        </a>
                    ))}
                </div>

                {/* 2. Banner Active Cycle (Premium Dark Mode) */}
                {activeCycle && (
                    <div className="relative mb-16 overflow-hidden rounded-[3rem] bg-[#0f0f0f] p-10 md:p-14 text-white shadow-3xl">
                        {/* Interactive gradients */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 via-transparent to-amber-500/10 opacity-60" />
                        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-orange-600/20 blur-[120px] animate-pulse" />
                        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2.5 rounded-full bg-white/5 px-4 py-1.5 backdrop-blur-xl border border-white/10 mb-6">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-400">Exclusive Cycle</span>
                                </div>

                                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] mb-6">
                                    {activeCycle.name.split(' ')[0]} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-300 to-amber-200">
                                        {activeCycle.name.split(' ')[1] || 'Edition'}
                                    </span>
                                </h2>

                                <p className="text-gray-400 text-base font-medium max-w-sm leading-relaxed">
                                    Explora las mejores ofertas de la temporada seleccionadas especialmente para ti.
                                </p>
                            </div>

                            <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 lg:min-w-[280px] flex flex-col items-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4">Válido hasta</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-6xl font-black text-white lining-nums tabular-nums">
                                        {activeCycle.endDate.getDate()}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black uppercase text-orange-400 leading-none">
                                            {activeCycle.endDate.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '')}
                                        </span>
                                        <span className="text-sm font-bold text-gray-600 leading-none mt-1">
                                            {activeCycle.endDate.getFullYear()}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-8 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-orange-600 to-amber-400 w-2/3 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {products.map((product) => (
                        <HorizontalProductCard
                            key={product.id}
                            product={product}
                            consultantId={consultant.id}
                            consultantSlug={consultantSlug}
                        />
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-gray-400 text-4xl">inventory_2</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No hay productos disponibles</h3>
                        <p className="text-gray-500 mt-2 max-w-xs">Intenta seleccionando otra marca o vuelve más tarde.</p>
                        {brandSlug && (
                            <a href={`/${consultantSlug}`} className="mt-6 text-natura-orange font-bold hover:underline">
                                Ver todas las marcas
                            </a>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
