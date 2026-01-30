'use client';

import { useTransition } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, Trash } from 'lucide-react';
import { updateItemQuantity, removeCartItem } from '@/app/actions';

interface CheckoutItemProps {
    item: any; // Using any for simplicity in rapid prototype, but should match Prisma CartItem include Product
    cycleId: string | undefined | null;
}

export function CheckoutItem({ item, cycleId }: CheckoutItemProps) {
    const [isPending, startTransition] = useTransition();

    const product = item.product;
    if (!product) return null;

    // Resolve Price
    const cyclePrice = product.cyclePrices.find((cp: any) => cp.cycleId === cycleId);
    const price = cyclePrice ? Number(cyclePrice.price) : Number(product.price);

    // Variant Info
    const variant = item.selectedVariant as { name: string, color?: string, sku?: string } | null;

    const handleUpdate = (delta: number) => {
        startTransition(async () => {
            await updateItemQuantity(item.id, item.quantity + delta);
        });
    };

    return (
        <div className="group flex items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/60 transition-all duration-300 hover:shadow-md">
            {/* Image Container */}
            <div className="relative h-20 w-20 shrink-0 bg-white rounded-xl overflow-hidden shadow-inner border border-gray-50 flex items-center justify-center p-1">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-1 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                        sizes="80px"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-[10px] text-gray-300 font-bold uppercase tracking-tight">
                        <ShoppingBag className="w-5 h-5 mb-1 opacity-20" />
                        Sin foto
                    </div>
                )}
                {variant?.color && (
                    <div
                        className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white shadow-md ring-1 ring-black/5"
                        style={{ backgroundColor: variant.color }}
                    />
                )}
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0 py-1">
                <p className="text-gray-950 text-base font-black leading-tight tracking-tight line-clamp-2">
                    {product.name}
                </p>
                <div className="mt-1.5 flex flex-col gap-0.5">
                    <p className="text-gray-400 text-xs font-bold tracking-wide">
                        S/ {price.toFixed(2)} c/u
                    </p>
                    {variant && (
                        <p className="text-[10px] text-natura-orange font-black uppercase tracking-[0.1em]">
                            Tono: {variant.name}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions Section */}
            <div className="shrink-0 pl-1">
                <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-xl border border-gray-100">
                    <button
                        disabled={isPending}
                        onClick={() => handleUpdate(-1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm text-gray-950 hover:bg-gray-50 active:scale-90 transition-all disabled:opacity-50"
                    >
                        {item.quantity === 1 ? <Trash className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-sm font-black w-5 text-center tabular-nums text-gray-950">{item.quantity}</span>
                    <button
                        disabled={isPending}
                        onClick={() => handleUpdate(1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950 text-white shadow-sm hover:bg-black active:scale-90 transition-all disabled:opacity-50"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
