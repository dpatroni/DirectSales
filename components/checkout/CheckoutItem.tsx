'use client';

import { useTransition } from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash } from 'lucide-react';
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
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="relative h-16 w-16 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-xs">No img</div>
                )}
                {variant?.color && (
                    <div
                        className="absolute bottom-1 right-1 w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-gray-200"
                        style={{ backgroundColor: variant.color }}
                    />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-slate-100 text-sm font-semibold leading-normal line-clamp-1">
                    {product.name}
                </p>
                <div className="flex flex-col">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-normal">
                        S/ {price.toFixed(2)} c/u
                    </p>
                    {variant && (
                        <p className="text-[10px] text-orange-600 font-medium truncate">
                            Tono: {variant.name}
                        </p>
                    )}
                </div>
            </div>

            <div className="shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-100 dark:border-gray-700">
                    <button
                        disabled={isPending}
                        onClick={() => handleUpdate(-1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-white dark:bg-gray-700 shadow-sm text-slate-600 dark:text-slate-200 hover:bg-gray-100 active:scale-95 disabled:opacity-50"
                    >
                        {item.quantity === 1 ? <Trash className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                    </button>
                    <span className="text-sm font-bold w-4 text-center tabular-nums">{item.quantity}</span>
                    <button
                        disabled={isPending}
                        onClick={() => handleUpdate(1)}
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white shadow-sm hover:bg-orange-600 active:scale-95 disabled:opacity-50"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
