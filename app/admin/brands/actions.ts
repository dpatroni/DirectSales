'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleBrandStatus(formData: FormData) {
    const brandId = formData.get('brandId') as string;
    const currentStatus = formData.get('currentStatus') === 'true';

    await prisma.brand.update({
        where: { id: brandId },
        data: { isActive: !currentStatus }
    });

    revalidatePath('/admin/brands');
}
