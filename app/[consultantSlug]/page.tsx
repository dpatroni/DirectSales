import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { HorizontalProductCard, ProductWithPrice } from '@/components/ui/HorizontalProductCard';
import { cookies } from 'next/headers';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ShoppingBag } from 'lucide-react';

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
        <div className="min-h-screen bg-[#FDFCFD] mesh-gradient pb-32 overflow-hidden relative">
            {/* Ambient Lighting Effects */}
            <div className="ambient-glow -top-20 -left-20" />
            <div className="ambient-glow top-[40%] -right-40" style={{ background: 'radial-gradient(circle, hsla(45, 100%, 75%, 0.05) 0%, transparent 70%)' }} />

            <Header consultantName={consultant.name} />

            <main className="container mx-auto px-6 py-12 relative z-10">
                {/* 1. HERO BANNER - Luxury Light Edition */}
                {activeCycle && (
                    <div className="relative mb-24 group">
                        {/* Soft Ethereal Background */}
                        <div className="absolute inset-0 elite-glass rounded-[4rem] transition-all duration-700 group-hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border-white/80" />

                        <div className="relative z-10 p-12 md:p-20 flex flex-col lg:flex-row lg:items-center justify-between gap-16">
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-[1.5px] w-12 bg-natura-orange/30" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-natura-orange">Edición Limitada</span>
                                </div>

                                <h2 className="text-6xl md:text-9xl font-black text-gray-950 tracking-tighter leading-[0.8] mb-10">
                                    {activeCycle.name.split(' ')[0]} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-natura-orange via-orange-400 to-pink-500">
                                        {activeCycle.name.split(' ')[1] || 'VIBES'}
                                    </span>
                                </h2>

                                <p className="text-gray-500 text-lg md:text-xl font-medium max-w-md leading-relaxed">
                                    Curaduría profesional de alta gama diseñada para resaltar tu brillo natural.
                                </p>
                            </div>

                            <div className="lg:min-w-[320px]">
                                <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/60 flex flex-col items-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.03)] group-hover:-translate-y-2 transition-transform duration-700">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">Expiración</span>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <span className="block text-7xl font-black text-gray-950 leading-none lining-nums tabular-nums uppercase">
                                                {activeCycle.endDate.getDate()}
                                            </span>
                                        </div>
                                        <div className="h-16 w-[1px] bg-gray-200" />
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black uppercase text-natura-orange leading-none">
                                                {activeCycle.endDate.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '')}
                                            </span>
                                            <span className="text-sm font-bold text-gray-400 mt-1">
                                                {activeCycle.endDate.getFullYear()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-10 w-full">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                            <span>Progress</span>
                                            <span>85%</span>
                                        </div>
                                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-natura-orange to-orange-300 w-[85%] rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MINIMALIST NAVIGATION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
                    <div>
                        <span className="text-[10px] font-black text-natura-orange uppercase tracking-[0.4em] mb-4 block">Catálogo</span>
                        <h3 className="text-4xl font-black text-gray-950 tracking-tighter">Nuestras Marcas</h3>
                    </div>

                    <div className="no-scrollbar flex items-center gap-4 overflow-x-auto pb-2">
                        <a
                            href={`/${consultantSlug}`}
                            className={cn(
                                "whitespace-nowrap px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                                !brandSlug
                                    ? "bg-black text-white shadow-2xl shadow-black/20 scale-105"
                                    : "bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black"
                            )}
                        >
                            Todas
                        </a>
                        {availableBrands.map(b => (
                            <a
                                key={b.id}
                                href={`/${consultantSlug}?brand=${b.slug}`}
                                className={cn(
                                    "whitespace-nowrap px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                                    brandSlug === b.slug
                                        ? "bg-black text-white shadow-2xl shadow-black/20 scale-105"
                                        : "bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black"
                                )}
                            >
                                {b.name}
                            </a>
                        ))}
                    </div>
                </div>

                {/* 3. PRODUCT GRID - High Res Spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                    {products.map((product) => (
                        <HorizontalProductCard
                            key={product.id}
                            product={product}
                            consultantId={consultant.id}
                            consultantSlug={consultantSlug}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {products.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <div className="size-32 elite-glass rounded-full flex items-center justify-center mb-8 animate-bounce">
                            <ShoppingBag className="text-gray-200 w-12 h-12" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-950 tracking-tighter">Colección no disponible</h3>
                        <p className="text-gray-400 mt-4 max-w-xs font-medium">Estamos actualizando nuestro stock. Intenta con otra marca.</p>
                        {brandSlug && (
                            <a href={`/${consultantSlug}`} className="mt-10 px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-110 transition-transform">
                                Volver al inicio
                            </a>
                        )}
                    </div>
                )}
            </main>

            {/* Bottom Decor */}
            <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-orange-50/30 to-transparent pointer-events-none -z-10" />
        </div>
    );
}
