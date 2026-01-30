import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import OnboardingWizard from './OnboardingWizard'
import { getBrands, getConsultantProfile } from '@/app/actions/onboarding'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Double check if already onboarded to prevent re-entry
    const consultant = await prisma.consultant.findUnique({
        where: { authId: user.id }
    })

    if (!consultant) {
        // Not a consultant (maybe admin or client), redirect home
        redirect('/')
    }

    if (consultant.primaryBrandId && consultant.phone) {
        // Already onboarded
        redirect(`/${consultant.slug}`)
    }

    const brands = await getBrands()
    const profile = await getConsultantProfile()

    return (
        <div className="min-h-screen bg-white">
            <OnboardingWizard initialBrands={brands} initialName={profile?.name || ''} />
        </div>
    )
}
