'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
    const sku = formData.get('sku') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const brandId = formData.get('brandId') as string;
    const price = parseFloat(formData.get('price') as string);
    const points = parseInt(formData.get('points') as string);
    const isRefill = formData.get('isRefill') === 'on';

    // Optional: parentProductId for Refills (not implementing full logic here for brevity, focusing on Brand)

    await prisma.product.create({
        data: {
            sku,
            name,
            description,
            brandId,
            price,
            points,
            isRefill
        }
    });

    revalidatePath('/admin/products');
    redirect('/admin/products');
}
