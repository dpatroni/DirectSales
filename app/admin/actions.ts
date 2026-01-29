'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Create Consultant
export async function createConsultant(formData: FormData) {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Admin Check (Optional but good)
    const admin = await prisma.admin.findUnique({ where: { authId: user.id } });
    if (!admin) throw new Error('Forbidden');

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const slug = formData.get('slug') as string;
    const bio = formData.get('bio') as string;
    const phone = formData.get('phone') as string;

    try {
        await prisma.consultant.create({
            data: {
                name,
                email,
                slug,
                bio,
                phone
            }
        });
    } catch (e) {
        console.error(e);
        throw new Error('Error al crear consultora. El slug o email podría estar duplicado.');
    }

    revalidatePath('/admin/consultants');
    redirect('/admin/consultants');
}

// Update Consultant
export async function updateConsultant(id: string, formData: FormData) {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    const admin = await prisma.admin.findUnique({ where: { authId: user.id } });
    if (!admin) throw new Error('Forbidden');

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const bio = formData.get('bio') as string;
    const phone = formData.get('phone') as string;
    // Email usually shouldn't be changed lightly if it links to Auth, but fine for now.

    try {
        await prisma.consultant.update({
            where: { id },
            data: {
                name,
                slug,
                bio,
                phone
            }
        });
    } catch (e) {
        console.error(e);
        throw new Error('Error al actualizar consultora');
    }

    revalidatePath('/admin/consultants');
    revalidatePath('/admin/consultants/[id]');
    redirect('/admin/consultants');
}

// Toggle Cycle Status
export async function toggleCycleStatus(cycleId: string, isActive: boolean) {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    const admin = await prisma.admin.findUnique({ where: { authId: user.id } });
    if (!admin) throw new Error('Forbidden');

    // If turning ON, turn off all others first (single active cycle rule)
    if (isActive) {
        await prisma.cycle.updateMany({
            where: { id: { not: cycleId } },
            data: { isActive: false }
        });
    }

    await prisma.cycle.update({
        where: { id: cycleId },
        data: { isActive }
    });

    revalidatePath('/admin/cycles');
}
