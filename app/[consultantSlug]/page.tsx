import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { ProductCard, ProductWithPrice } from '@/components/ui/ProductCard';
import { cookies } from 'next/headers';

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
            refillProduct: refillVersion
        };
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header consultantName={consultant.name} />

            <main className="container mx-auto px-4 py-6">

                {/* Brand Filter */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
                    <a
                        href={`/${consultantSlug}`}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition ${!brandSlug ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Todas
                    </a>
                    {availableBrands.map(b => (
                        <a
                            key={b.id}
                            href={`/${consultantSlug}?brand=${b.slug}`}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition ${brandSlug === b.slug ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            {b.name}
                        </a>
                    ))}
                </div>

                {/* Banner Active Cycle */}
                {activeCycle && (
                    <div className="mb-6 rounded-lg bg-orange-100 p-4 text-center text-orange-800 border border-orange-200">
                        <h2 className="text-sm font-bold uppercase tracking-wide">
                            {activeCycle.name}
                        </h2>
                        <p className="text-xs mt-1">
                            Precios promocionales vigentes hasta el {activeCycle.endDate.toLocaleDateString()}
                        </p>
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} consultantId={consultant.id} />
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>No se encontraron productos para esta selección.</p>
                        {brandSlug && (
                            <a href={`/${consultantSlug}`} className="text-primary hover:underline text-sm mt-2 block">
                                Ver todas las marcas
                            </a>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
