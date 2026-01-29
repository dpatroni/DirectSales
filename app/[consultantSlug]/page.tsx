import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Header } from '@/components/layout/Header';
import { ProductCard, ProductWithPrice } from '@/components/ui/ProductCard';
import { cookies } from 'next/headers';

interface PageProps {
    params: Promise<{
        consultantSlug: string;
    }>;
}

export default async function CatalogPage({ params }: PageProps) {
    const { consultantSlug } = await params;

    // 1. Fetch Consultant
    const consultant = await prisma.consultant.findUnique({
        where: { slug: consultantSlug },
    });

    if (!consultant) {
        notFound();
    }

    // 2. Fetch Active Cycle
    const activeCycle = await prisma.cycle.findFirst({
        where: { isActive: true },
    });

    // 2.1 Persist Consultant Slug -> Moved to Middleware
    // Server Components cannot set cookies directly during render.

    // 3. Fetch Products (Main products only, including relation to Refills)
    const consultantProducts = await prisma.consultantProduct.findMany({
        where: {
            consultantId: consultant.id,
            isVisible: true,
            product: {
                isRefill: false, // Show only main products in the grid
            },
        },
        include: {
            product: {
                include: {
                    cyclePrices: activeCycle ? {
                        where: { cycleId: activeCycle.id }
                    } : false,
                    refillProduct: {
                        include: {
                            cyclePrices: activeCycle ? {
                                where: { cycleId: activeCycle.id }
                            } : false,
                            // Check if refill is also activated for this consultant
                            consultantProducts: {
                                where: { consultantId: consultant.id, isVisible: true }
                            }
                        }
                    }
                }
            }
        }
    });

    // 4. Map to UI Model
    const products: ProductWithPrice[] = consultantProducts.map((cp) => {
        const p = cp.product;

        // Main Product Price
        const mainPrice = p.cyclePrices[0];
        const basePrice = Number(p.price);
        const promotionalPrice = mainPrice?.isPromotional ? Number(mainPrice.price) : null;

        // Refill Logic
        let refillVersion: ProductWithPrice | null = null;

        // Check if refill exists and is active for this consultant
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
                        <p>La consultora no tiene productos disponibles en este momento.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
