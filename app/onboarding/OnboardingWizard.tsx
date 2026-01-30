'use client'

import { useState } from 'react'
import { saveOnboardingProfile } from '@/app/actions/onboarding'
import { useRouter } from 'next/navigation'
import { ChevronRight, X, ArrowRight, Loader2, Check } from 'lucide-react'

type Brand = {
    id: string
    name: string
    slug: string
}

export default function OnboardingWizard({
    initialBrands,
    initialName,
    saveAction
}: {
    initialBrands: Brand[],
    initialName: string,
    saveAction?: (data: any) => Promise<{ success: boolean, slug: string }>
}) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // State
    const [name, setName] = useState(initialName)
    const [brandId, setBrandId] = useState<string | null>(null)
    const [phone, setPhone] = useState('')

    const handleNext = () => {
        if (step < 3) setStep(s => s + 1)
        else handleComplete()
    }

    const canProceed = () => {
        if (step === 1) return !!name
        if (step === 2) return !!brandId
        if (step === 3) return !!phone
        return false
    }

    const handleComplete = async () => {
        if (!name || !brandId || !phone) return

        setLoading(true)
        try {
            const actionToUse = saveAction || saveOnboardingProfile
            const result = await actionToUse({
                name,
                primaryBrandId: brandId,
                phone: phone.startsWith('+') ? phone : `+51 ${phone}`
            })

            if (result.success) {
                router.push(`/${result.slug}`)
            } else {
                // @ts-ignore
                alert('Error del Servidor: ' + (result.error || 'Fallo desconocido'))
                setLoading(false)
            }
        } catch (error: any) {
            console.error(error)
            alert('Error de Cliente: ' + (error.message || JSON.stringify(error)))
            setLoading(false)
        }
    }

    return (
        <div className="relative flex h-full min-h-screen w-full max-w-[430px] mx-auto flex-col bg-background-light dark:bg-background-dark overflow-x-hidden shadow-2xl">

            {/* Header */}
            <div className="flex flex-col gap-3 p-4 pt-6">
                <div className="flex gap-6 justify-between items-center">
                    <p className="text-primary text-sm font-bold uppercase tracking-wider">
                        Paso {step} de 3
                    </p>
                    <button className="text-[#1b0d12] dark:text-white cursor-pointer hover:bg-black/5 rounded-full p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="rounded-full bg-primary/20 dark:bg-white/10 h-2 w-full overflow-hidden">
                    <div
                        className="h-2 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Hero Image (Shows only on Step 1, or always? Mockup shows it. Let's keep it but maybe smaller on later steps or consistent) */}
            <div className={`@container px-4 transition-all duration-500 ${step === 1 ? 'opacity-100 max-h-[200px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <div
                    className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl h-[180px]
                             bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 shadow-inner"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC9WRh4xrDdSUqXiZoBy5S8etfm2BMksEP5dUfhL9vIUvWLDByh8wxYQn3XZyXyiA7AbkRae9sZJhIe51b4BuzYhvknMHMVpnFsuoosCUiwoCD5Oh1p2AnraGPwf9_gsWBAwJxPHGpTZIlTkOf8R1IUEZUX_JsMORl0wXF9TfEasj-g96mNg1odbtB63FfPzoWLPG4tbPGuP-Skt5RhtB5UEddmzhs-83-F1VamrV-ajb2lTifPxtJJ48LiBLRN3315kN3bJzh8dq0")' }}
                >
                </div>
            </div>

            {/* Headline */}
            <div className="px-4 pt-6 pb-2 mb-4">
                <h2 className="text-[#1b0d12] dark:text-white text-[28px] font-extrabold leading-tight">
                    {step === 1 && "Bienvenida a tu catálogo digital"}
                    {step === 2 && "Elige tu Marca Principal"}
                    {step === 3 && "Conecta tu WhatsApp"}
                </h2>
                <p className="text-[#1b0d12]/60 dark:text-white/60 text-base mt-2">
                    {step === 1 && "Configuremos tu perfil para que empieces a compartirlo con tus clientes por WhatsApp."}
                    {step === 2 && "Personalizaremos la experiencia de tu catálogo basándonos en tu marca principal."}
                    {step === 3 && "Este será el número al que tus clientes enviarán sus pedidos automáticos."}
                </p>
            </div>

            {/* Form Content */}
            <div className="flex flex-col gap-1 pb-32 flex-grow animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* STEP 1: NAME */}
                {step === 1 && (
                    <div className="px-4 py-3">
                        <label className="flex flex-col w-full">
                            <p className="text-sm font-bold pb-2 px-1 text-[#1b0d12] dark:text-white">
                                Nombre completo
                            </p>
                            <input
                                className="w-full rounded-xl h-14 p-[15px] border bg-white dark:bg-white/5
                                         border-[#e7cfd7] dark:border-white/10 focus:ring-2 focus:ring-primary/50 text-lg outline-none transition-all"
                                placeholder="Ej. María García"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </label>
                    </div>
                )}

                {/* STEP 2: BRAND */}
                {step === 2 && (
                    <div className="px-4 py-2">
                        <p className="text-sm font-bold pb-3 px-1 text-[#1b0d12] dark:text-white">
                            Selecciona una
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {initialBrands.map(brand => (
                                <button
                                    key={brand.id}
                                    onClick={() => setBrandId(brand.id)}
                                    className={`px-6 py-3 rounded-full border-2 font-semibold text-sm transition-all duration-200
                                        ${brandId === brand.id
                                            ? 'border-primary bg-primary text-white shadow-md transform scale-105'
                                            : 'border-[#e7cfd7] bg-white text-gray-700 hover:border-primary/50'
                                        }`}
                                >
                                    {brand.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: WHATSAPP */}
                {step === 3 && (
                    <div className="px-4 py-3">
                        <label className="flex flex-col w-full">
                            <p className="text-sm font-bold pb-2 px-1 text-[#1b0d12] dark:text-white">
                                Número de WhatsApp
                            </p>

                            <div className="relative flex items-center">
                                <div className="absolute left-4 border-r pr-3 border-gray-300">
                                    <span className="font-medium text-gray-600">+51</span>
                                </div>
                                <input
                                    type="tel"
                                    className="w-full rounded-xl h-14 pl-20 p-[15px]
                                             border bg-white dark:bg-white/5 border-[#e7cfd7] dark:border-white/10
                                             focus:ring-2 focus:ring-primary/50 outline-none text-lg"
                                    placeholder="987 654 321"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </label>
                    </div>
                )}

            </div>

            {/* Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-gradient-to-t from-background-light via-background-light to-transparent pb-8">
                <button
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg
                             flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70 disabled:scale-100"
                >
                    <span>{loading ? 'Guardando...' : step === 3 ? 'Comenzar' : 'Continuar'}</span>
                    {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
            </div>

        </div>
    )
}
