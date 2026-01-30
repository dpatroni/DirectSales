'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Share2, CheckCircle, Gift, Leaf, Recycle, ShoppingBag
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { addToCart } from '@/app/actions';
import { Toast } from './Toast';

// Helper
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface Variant {
    name: string;
    sku: string;
    color: string;
}

interface ProductDetailClientProps {
    product: {
        id: string;
        sku: string;
        name: string;
        description: string | null;
        basePrice: number;
        price: number;
        points: number;
        imageUrl?: string | null;
        variants?: any;
    };
    consultant: {
        id: string;
        name: string;
        phone: string | null;
    };
}

export function ProductDetailClient({ product, consultant }: ProductDetailClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showToast, setShowToast] = useState(false);

    // Variant state
    const variants = (product.variants as Variant[]) || [];
    const hasVariants = variants.length > 0;
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

    const price = product.price;
    const basePrice = product.basePrice;
    const isPromo = price < basePrice;
    const savings = basePrice - price;

    const handleAddToCart = () => {
        if (hasVariants && !selectedVariant) {
            // Shake/Highlight variant selector? For now just return or alert
            alert("Por favor selecciona un tono/variante.");
            return;
        }

        startTransition(async () => {
            const variantData = selectedVariant ? selectedVariant : undefined;
            const result = await addToCart(consultant.id, product.id, 1, variantData);
            if (result.success) {
                setShowToast(true);
            }
        });
    };

    const handleWhatsAppOrder = () => {
        if (!consultant.phone) return;

        const variantText = selectedVariant ? ` (Tono: ${selectedVariant.name})` : '';
        const text = `Hola ${consultant.name}, quiero pedir el producto: *${product.name}*${variantText} (S/ ${price.toFixed(2)}).`;
        const url = `https://wa.me/${consultant.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: `Mira este producto: ${product.name}`,
                url: window.location.href,
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFD] mesh-gradient relative overflow-x-hidden flex justify-center">
            {/* Ambient Lighting */}
            <div className="ambient-glow -top-20 -left-20 opacity-40" />
            <div className="ambient-glow top-[60%] -right-40 opacity-30" style={{ background: 'radial-gradient(circle, hsla(45, 100%, 75%, 0.05) 0%, transparent 70%)' }} />

            <Toast
                message="Agregado al carrito"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />

            <div className="w-full max-w-[430px] min-h-screen relative pb-40 z-10">
                {/* Header */}
                <header className="fixed top-0 w-full max-w-[430px] z-50 px-6 py-8 flex items-center justify-between bg-white/40 backdrop-blur-xl border-b border-white/40">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white/80 rounded-2xl shadow-sm border border-white/60 hover:bg-white transition-all active:scale-90"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-950" />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-950">Vistazo Elite</span>
                    <button
                        onClick={handleShare}
                        className="p-3 bg-white/80 rounded-2xl shadow-sm border border-white/60 hover:bg-white transition-all active:scale-90"
                    >
                        <Share2 className="w-5 h-5 text-gray-950" />
                    </button>
                </header>

                <main className="pt-32 px-6">
                    {/* Image Spotlight */}
                    <div className="relative aspect-square w-full mb-12 group">
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-white/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.04)]" />

                        {isPromo && (
                            <div className="absolute top-6 right-6 bg-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl z-20">
                                -{Math.round(((basePrice - price) / basePrice) * 100)}% OFF
                            </div>
                        )}

                        <div className="relative h-full w-full p-12 flex items-center justify-center">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    width={800}
                                    height={800}
                                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-1000 group-hover:scale-105"
                                    priority
                                />
                            ) : (
                                <div className="w-32 h-32 text-gray-100 italic font-black text-8xl opacity-10 select-none">
                                    Natura
                                </div>
                            )}
                        </div>

                        {/* Point Badge */}
                        <div className="absolute -bottom-4 -left-2 bg-emerald-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/20 z-20">
                            +{product.points} PTS
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-10">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="h-[1.5px] w-8 bg-natura-orange/40" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-natura-orange">Colección Curada</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter leading-[0.9] mb-4">
                                {product.name}
                            </h2>

                            <div className="flex items-baseline gap-4 mt-8">
                                <span className="text-4xl font-black text-gray-950 tracking-tighter">
                                    S/ {price.toFixed(2)}
                                </span>
                                {isPromo && (
                                    <span className="text-xl text-gray-300 font-bold line-through tracking-tighter">
                                        S/ {basePrice.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Variants Selector */}
                        {hasVariants && (
                            <div className="elite-glass rounded-[2.5rem] p-8 border-white/80">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-8 flex items-center gap-3">
                                    <span className="size-1.5 rounded-full bg-natura-orange" />
                                    Personaliza tu elección
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {variants.map((v, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedVariant(v)}
                                            className={cn(
                                                "group flex items-center gap-4 p-4 rounded-3xl border transition-all duration-500",
                                                selectedVariant?.sku === v.sku
                                                    ? "bg-black border-black shadow-xl"
                                                    : "bg-white border-white/60 hover:border-gray-200"
                                            )}
                                        >
                                            <div
                                                className="size-12 rounded-2xl border-2 border-white/20 shadow-inner group-active:scale-95 transition-transform"
                                                style={{ backgroundColor: v.color }}
                                            />
                                            <span className={cn(
                                                "text-xs font-black uppercase tracking-tight",
                                                selectedVariant?.sku === v.sku ? "text-white" : "text-gray-950"
                                            )}>
                                                {v.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 flex items-center gap-3">
                                <span className="size-1.5 rounded-full bg-gray-200" />
                                La Experiencia
                            </h3>
                            <p className="text-gray-600 text-lg font-medium leading-[1.6] tracking-tight">
                                {product.description}
                            </p>
                        </div>

                        {/* Eco Credentials */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Leaf, label: "Vegano" },
                                { icon: Recycle, label: "Sustentable" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-center gap-3 p-6 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/80 shadow-sm">
                                    <item.icon className="w-5 h-5 text-emerald-600" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-600">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Fixed Bottom Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto p-8 pt-12 bg-gradient-to-t from-[#FDFCFD] via-[#FDFCFD] to-transparent z-50">
                    <div className="flex gap-4">
                        <button
                            onClick={handleWhatsAppOrder}
                            className="bg-emerald-600 text-white p-5 rounded-[2rem] shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-90"
                        >
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.512-2.96-2.626-.088-.113-.716-.953-.716-1.819 0-.866.454-1.292.614-1.456.16-.163.346-.204.461-.204a.274.274 0 0 1 .204.091c.081.091.279.684.305.736.026.053.04.113.003.188-.036.075-.054.12-.11.185-.058.067-.114.113-.163.171-.052.057-.107.119-.046.223.061.103.27.446.58.723.4.357.737.467.841.52.104.053.166.044.227-.026.061-.07.259-.301.328-.404.069-.103.138-.088.232-.053.093.035.592.279.695.331.102.053.171.079.197.123s.026.255-.118.66z" />
                            </svg>
                        </button>

                        <button
                            onClick={handleAddToCart}
                            disabled={isPending || (hasVariants && !selectedVariant)}
                            className="flex-1 bg-gray-950 text-white py-5 rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
                        >
                            {isPending ? (
                                <span className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em]">Preparando...</span>
                            ) : (
                                <>
                                    <ShoppingBag className="w-5 h-5" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Llevar Producto</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
