'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function saveOnboardingProfile(data: {
    name: string
    primaryBrandId: string
    phone: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('No autenticado')
    }

    // 1. Find Consultant by Auth ID
    const consultant = await prisma.consultant.findUnique({
        where: { authId: user.id }
    })

    if (!consultant) {
        throw new Error('Consultora no encontrada')
    }

    // 2. Update Profile
    const updated = await prisma.consultant.update({
        where: { id: consultant.id },
        data: {
            name: data.name,
            primaryBrandId: data.primaryBrandId,
            phone: data.phone,
        }
    })

    // 3. Revalidate
    revalidatePath(`/${updated.slug}`)

    // 4. Return slug for redirection
    return { success: true, slug: updated.slug }
}

export async function devSaveOnboardingProfile(data: {
    name: string
    primaryBrandId: string
    phone: string
}) {
    // BYPASS AUTH: Hardcode to test user
    const TEST_EMAIL = 'dpatroniv+test2@gmail.com'

    console.log('⚠️ DEV MODE: Saving onboarding for test user:', TEST_EMAIL)
    console.log('   Data received:', {
        name: data.name,
        brandId: data.primaryBrandId,
        phone: data.phone,
        brandType: typeof data.primaryBrandId
    })

    try {
        if (!data.primaryBrandId || typeof data.primaryBrandId !== 'string') {
            throw new Error(`Invalid or Missing Brand ID: ${data.primaryBrandId}`)
        }

        // 1. Find Consultant by Email (Test User)
        const consultant = await prisma.consultant.findFirst({
            where: { email: TEST_EMAIL }
        })

        if (!consultant) {
            console.error('❌ Test user not found:', TEST_EMAIL)
            throw new Error('Usuario de prueba no encontrado. Corre el script de setup primero.')
        }

        console.log('   Found consultant:', consultant.id)

        // 2. Update Profile
        const updated = await prisma.consultant.update({
            where: { id: consultant.id },
            data: {
                name: data.name,
                primaryBrandId: data.primaryBrandId,
                phone: data.phone,
            }
        })

        console.log('   ✅ Update successful:', updated.slug)

        // 3. Revalidate
        revalidatePath(`/${updated.slug}`)

        return { success: true, slug: updated.slug }

    } catch (e: any) {
        console.error('❌ Error in devSaveOnboardingProfile:', e)
        return { success: false, slug: '', error: e.message || 'Unknown server error' }
    }
}

export async function getBrands() {
    return await prisma.brand.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true }
    })
}

export async function getConsultantProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return await prisma.consultant.findUnique({
        where: { authId: user.id },
        select: { id: true, name: true, phone: true }
    })
}
