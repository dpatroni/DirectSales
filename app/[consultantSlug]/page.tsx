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
                <div className="no-scrollbar mb-10 flex snap-x items-center gap-3 overflow-x-auto pb-4 pt-2">
                    <a
                        href={`/${consultantSlug}`}
                        className={cn(
                            "flex snap-center items-center justify-center whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300",
                            !brandSlug
                                ? "bg-natura-orange text-white shadow-lg shadow-orange-500/25 scale-105"
                                : "bg-white text-gray-500 border border-gray-100 hover:border-orange-200 hover:text-orange-600"
                        )}
                    >
                        Todas
                    </a>
                    {availableBrands.map(b => (
                        <a
                            key={b.id}
                            href={`/${consultantSlug}?brand=${b.slug}`}
                            className={cn(
                                "flex snap-center items-center justify-center whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300",
                                brandSlug === b.slug
                                    ? "bg-natura-orange text-white shadow-lg shadow-orange-500/25 scale-105"
                                    : "bg-white text-gray-500 border border-gray-100 hover:border-orange-200 hover:text-orange-600"
                            )}
                        >
                            {b.name}
                        </a>
                    ))}
                </div>

                {/* 2. Banner Active Cycle (Premium Display) */}
                {activeCycle && (
                    <div className="relative mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-600 p-8 text-white shadow-2xl shadow-orange-500/20">
                        {/* Decorative elements */}
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-orange-300/10 blur-3xl" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm border border-white/10 mb-3">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Cerrando pronto</span>
                                </div>
                                <h2 className="text-4xl font-black tracking-tight leading-tight">
                                    {activeCycle.name.split(' ')[0]} <br />
                                    <span className="text-orange-100">{activeCycle.name.split(' ')[1]}</span>
                                </h2>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[200px]">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-100 mb-1">Válido hasta</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black">
                                        {activeCycle.endDate.getDate()}
                                    </span>
                                    <span className="text-sm font-bold uppercase">
                                        {activeCycle.endDate.toLocaleDateString('es-PE', { month: 'long' })}
                                    </span>
                                </div>
                                <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-3/4 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
