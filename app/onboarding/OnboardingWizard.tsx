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
        <div className="relative flex h-full min-h-screen w-full max-w-[430px] mx-auto flex-col mesh-gradient overflow-x-hidden shadow-2xl transition-all duration-1000">
            {/* Ambient Background Glows */}
            <div className="ambient-glow -top-40 -left-40 opacity-40" />
            <div className="ambient-glow top-[60%] -right-40 opacity-30" style={{ background: 'radial-gradient(circle, hsla(45, 100%, 75%, 0.05) 0%, transparent 70%)' }} />

            {/* Header / Progress */}
            <div className="flex flex-col gap-3 p-8 pt-10 relative z-10">
                <div className="flex gap-6 justify-between items-center mb-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-natura-orange/60">
                        Concept / Step {step} of 3
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-400 hover:text-gray-950 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="rounded-full bg-gray-100 h-[3px] w-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-natura-orange transition-all duration-700 ease-out"
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

            {/* Headline Section */}
            <div className="px-8 pt-4 pb-2 mb-8 relative z-10">
                <h2 className="text-gray-950 text-4xl md:text-5xl font-black leading-[0.9] tracking-tighter transition-all duration-700">
                    {step === 1 && <>Bienvenida a tu <span className="text-natura-orange">Legado.</span></>}
                    {step === 2 && <>Tu Sello <br /><span className="text-natura-orange">Personal.</span></>}
                    {step === 3 && <>Conexión con <br /><span className="text-natura-orange">WhatsApp.</span></>}
                </h2>
                <p className="text-gray-400 text-sm font-medium mt-6 leading-relaxed max-w-[90%]">
                    {step === 1 && "Configuremos tu estética profesional para empezar a compartir tu brillo con el mundo."}
                    {step === 2 && "Personalizaremos tu catálogo de lujo basándonos en tu marca de mayor impacto."}
                    {step === 3 && "Este será el puente digital directo entre tus clientes y sus nuevos productos favoritos."}
                </p>
            </div>

            {/* LIVE PREVIEW - Luxury Touch */}
            <div className="px-8 mb-10 transition-all duration-700 relative z-10">
                <div className="elite-glass rounded-[2rem] p-6 border-white/80 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Check className="w-12 h-12 text-natura-orange" />
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="size-10 rounded-full bg-gradient-to-tr from-natura-orange to-orange-300 flex items-center justify-center text-white font-black text-xs">
                            {name ? name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Preview Tienda</p>
                            <p className="text-xs font-bold text-gray-950">{name || 'Nombre Consultora'}</p>
                        </div>
                    </div>

                    <div className="h-[1px] w-full bg-gray-100 mb-4" />

                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-400">
                        <span>Marca: {initialBrands.find(b => b.id === brandId)?.name || '---'}</span>
                        <span className="text-natura-orange">Live Now</span>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="flex flex-col gap-1 pb-32 flex-grow animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">

                {/* STEP 1: NAME */}
                {step === 1 && (
                    <div className="px-8 py-3">
                        <label className="flex flex-col w-full">
                            <p className="text-[10px] font-black uppercase tracking-widest pb-3 px-1 text-gray-400">
                                Nombre de Consultora
                            </p>
                            <input
                                className="w-full rounded-2xl h-16 px-6 border bg-white/40 backdrop-blur-md
                                         border-white/60 focus:ring-2 focus:ring-natura-orange/20 text-gray-950 font-bold text-lg outline-none transition-all shadow-sm"
                                placeholder="Tu nombre real..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </label>
                    </div>
                )}

                {/* STEP 2: BRAND */}
                {step === 2 && (
                    <div className="px-8 py-2">
                        <p className="text-[10px] font-black uppercase tracking-widest pb-4 px-1 text-gray-400">
                            Foco Estratégico
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            {initialBrands.map(brand => (
                                <button
                                    key={brand.id}
                                    onClick={() => setBrandId(brand.id)}
                                    className={`px-4 py-5 rounded-3xl border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-300
                                        ${brandId === brand.id
                                            ? 'border-natura-orange bg-natura-orange text-white shadow-xl shadow-natura-orange/20 transform scale-[1.03]'
                                            : 'border-white/60 bg-white/40 text-gray-400 hover:border-natura-orange/50 hover:text-gray-600'
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
                    <div className="px-8 py-3">
                        <label className="flex flex-col w-full">
                            <p className="text-[10px] font-black uppercase tracking-widest pb-3 px-1 text-gray-400">
                                Contacto Directo (PE)
                            </p>

                            <div className="relative flex items-center">
                                <div className="absolute left-6 border-r pr-4 border-gray-100">
                                    <span className="font-black text-gray-400 text-sm tracking-widest">+51</span>
                                </div>
                                <input
                                    type="tel"
                                    className="w-full rounded-2xl h-16 pl-24 px-6
                                             border bg-white/40 backdrop-blur-md border-white/60
                                             focus:ring-2 focus:ring-natura-orange/20 outline-none text-gray-950 font-bold text-lg shadow-sm"
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
            <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-8 bg-gradient-to-t from-background-light via-background-light to-transparent pb-10 z-50">
                <button
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    className="w-full bg-gray-950 text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-[1.5rem] shadow-2xl
                             flex items-center justify-center gap-3 active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:scale-100 hover:bg-gray-800"
                >
                    <span>{loading ? 'Sincronizando...' : step === 3 ? 'Comenzar Mi Imperio' : 'Siguiente Paso'}</span>
                    {!loading && <ChevronRight className="w-5 h-5" />}
                </button>
            </div>

        </div>
    )
}
