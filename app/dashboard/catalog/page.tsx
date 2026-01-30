
import { getManagementCatalog, getCatalogFilters } from '@/app/actions/catalog';
import { CatalogItem } from '@/components/dashboard/catalog/CatalogItem';
import { CatalogFiltersUI } from '@/components/dashboard/catalog/CatalogFiltersUI';
import { CatalogSearch } from '@/components/dashboard/catalog/CatalogSearch';

type PageProps = {
    searchParams: Promise<{
        q?: string;
        brand?: string;
        cat?: string;
        promo?: string;
    }>;
}

export default async function CatalogManagementPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const filters = {
        query: params.q,
        brandId: params.brand,
        categoryId: params.cat,
        isPromo: params.promo === 'true'
    };

    const [products, filterOptions] = await Promise.all([
        getManagementCatalog(filters),
        getCatalogFilters()
    ]);

    return (
        <div className="pb-24 min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-natura-orange text-3xl">storefront</span>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Mis Productos</h1>
                    </div>
                </div>

                <div className="relative group">
                    <CatalogSearch initialQuery={filters.query} />
                </div>

                <div className="mt-4">
                    <CatalogFiltersUI
                        brands={filterOptions.brands}
                        categories={filterOptions.categories}
                        activeFilters={filters}
                    />
                </div>
            </header>

            {/* Product Grid */}
            <main className="p-4 grid grid-cols-1 gap-4">
                {products.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        {filters.query || filters.brandId || filters.isPromo ?
                            "No se encontraron productos con estos filtros." :
                            "No hay productos asignados."}
                    </div>
                ) : (
                    products.map(product => (
                        <CatalogItem key={product.id} product={product} />
                    ))
                )}
            </main>

            {/* Share Button (Floating) */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
                <button className="w-full bg-[#25D366] text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.67-1.614-.918-2.214-.242-.584-.488-.504-.67-.513-.171-.009-.367-.01-.563-.01-.197 0-.518.074-.788.374-.27.299-1.03 1.008-1.03 2.455 0 1.448 1.054 2.846 1.202 3.045.149.198 2.074 3.167 5.024 4.441.701.304 1.248.486 1.674.621.703.224 1.343.192 1.85.116.565-.084 1.758-.718 2.007-1.413.25-.694.25-1.289.175-1.413-.075-.124-.27-.198-.567-.348zM12.002 21.103c-1.632 0-3.225-.438-4.618-1.272l-.332-.198-3.435.901.917-3.348-.218-.347c-.917-1.46-1.4-3.153-1.4-4.902 0-5.113 4.158-9.27 9.274-9.27 2.477 0 4.805.964 6.556 2.717 1.75 1.752 2.714 4.081 2.714 6.556 0 5.115-4.16 9.272-9.276 9.272zM12.002 2a10.25 10.25 0 00-10.27 10.255c0 1.81.432 3.58 1.252 5.163L1.72 22.41l5.143-1.349a10.22 10.22 0 004.975 1.282c5.666 0 10.276-4.61 10.276-10.274A10.22 10.22 0 0012.002 2z"></path>
                    </svg>
                    <span className="font-bold">Compartir Catálogo WhatsApp</span>
                </button>
            </div>
        </div>
    );
}
