import OnboardingWizard from '../OnboardingWizard'
import { devSaveOnboardingProfile, getBrands } from '@/app/actions/onboarding'

export default async function OnboardingPreviewPage() {
    // Fetch Real Brands for Preview to ensure Valid Foreign Keys
    const brands = await getBrands()

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center">
            {/* Render Wizard with DEV Action to bypass Auth */}
            <OnboardingWizard
                initialBrands={brands}
                initialName=""
                saveAction={devSaveOnboardingProfile}
            />
        </div>
    )
}
