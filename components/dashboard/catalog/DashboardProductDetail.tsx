'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, CheckCircle, Gift, Leaf, Recycle, ShoppingBag
} from 'lucide-react';
import { addToCart } from '@/app/actions';
import { Toast } from '@/components/ui/Toast';

interface Variant {
    name: string;
    sku: string;
    color: string;
}

interface DashboardProductDetailProps {
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
    consultantId: string;
}

export function DashboardProductDetail({ product, consultantId }: DashboardProductDetailProps) {
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
            alert("Por favor selecciona un tono/variante.");
            return;
        }

        startTransition(async () => {
            const variantData = selectedVariant ? selectedVariant : undefined;
            const result = await addToCart(consultantId, product.id, 1, variantData);
            if (result.success) {
                setShowToast(true);
            }
        });
    };

    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen text-slate-900 dark:text-slate-100 flex justify-center">
            <Toast
                message="Agregado a tu pedido"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />

            <div className="w-full max-w-md bg-white dark:bg-gray-900 min-h-screen relative pb-32">
                {/* Header */}
                <header className="fixed top-0 w-full max-w-md z-50 px-4 py-4 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-md">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="font-semibold text-lg">Detalle</h1>
                    <div className="w-10"></div> {/* Spacer balance */}
                </header>

                <main className="mt-16">
                    {/* Hero / Image */}
                    <div className="relative bg-gradient-to-b from-orange-50 to-white dark:from-slate-800 dark:to-slate-900 px-4 pt-8 pb-12 overflow-hidden">
                        {isPromo && (
                            <div className="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse shadow-md z-10">
                                ¡Oferta!
                            </div>
                        )}

                        <div className="relative z-10 flex justify-center py-6">
                            {/* Product Image */}
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    width={600}
                                    height={600}
                                    className="w-4/5 h-auto object-contain drop-shadow-2xl rounded-2xl"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-64 h-64 bg-slate-200 rounded-2xl flex items-center justify-center">
                                    <ShoppingBag className="w-12 h-12 opacity-20" />
                                </div>
                            )}
                        </div>

                        {isPromo && (
                            <div className="absolute bottom-6 right-6 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center z-20">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ganancia Extra</span>
                                <span className="text-xl font-bold text-pink-600">S/ {savings.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="px-6 -mt-8 relative z-20">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-2">
                                <div className="pr-4">
                                    <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Natura</span>
                                    <h2 className="text-xl font-bold mt-1 text-slate-900 dark:text-white leading-tight">
                                        {product.name}
                                    </h2>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                    {product.points} pts
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                    S/ {price.toFixed(2)}
                                </span>
                                {isPromo && (
                                    <span className="text-lg text-slate-400 line-through">
                                        S/ {basePrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {/* Variants (if any) */}
                            {hasVariants && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-sm uppercase text-slate-500 mb-3">Elige tu tono:</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {variants.map((v, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${selectedVariant?.sku === v.sku ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200'}`}
                                            >
                                                <div className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: v.color }}></div>
                                                <span className="text-xs font-bold">{v.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {!selectedVariant && (
                                        <p className="text-xs text-orange-600 mt-2 font-medium animate-bounce">
                                            👆 Selecciona un tono para agregar
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm uppercase text-slate-500 dark:text-slate-400 tracking-wider">Descripción</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        </div>

                        {/* Bioactives / Eco Info */}
                        <div className="mt-8 space-y-6 mb-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <Leaf className="w-5 h-5 text-teal-600" />
                                    <span className="text-xs font-medium dark:text-gray-300">Producto Vegano</span>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <Recycle className="w-5 h-5 text-teal-600" />
                                    <span className="text-xs font-medium dark:text-gray-300">Envase Sustentable</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Bottom Bar */}
                <div className="fixed bottom-0 w-full max-w-md p-4 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-50 flex gap-3">
                    <button
                        onClick={handleAddToCart}
                        disabled={isPending || (hasVariants && !selectedVariant)}
                        className="flex-1 bg-natura-orange hover:bg-orange-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 text-sm font-bold disabled:opacity-50 disabled:grayscale"
                    >
                        {isPending ? 'Agregando...' : (
                            <>
                                <ShoppingBag className="w-5 h-5" />
                                Agregar a Mi Pedido
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
