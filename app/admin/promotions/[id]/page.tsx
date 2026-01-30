import { getAdminPromotion, getCyclesForSelector, getProductsForSelector } from '@/app/actions/admin-promotions';
import PromotionFormClient from '@/components/admin/promotions/PromotionFormClient';
import { notFound } from 'next/navigation';

type PageProps = {
    params: Promise<{ id: string }>;
}

export default async function AdminPromotionEditPage({ params }: PageProps) {
    const { id } = await params;
    const isNew = id === 'new';

    // Parallel fetch for valid ID
    const promotionPromise = (!isNew) ? getAdminPromotion(id) : Promise.resolve(null);
    const cyclesPromise = getCyclesForSelector();
    const productsPromise = getProductsForSelector();

    const [promotion, cycles, products] = await Promise.all([
        promotionPromise,
        cyclesPromise,
        productsPromise
    ]);

    if (!isNew && !promotion) {
        notFound();
    }

    return (
        <PromotionFormClient
            promotion={promotion}
            cycles={cycles}
            products={products}
        />
    );
}
