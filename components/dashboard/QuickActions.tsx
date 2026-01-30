
import Link from 'next/link';
import { Share2, PlusCircle, DollarSign, Bell } from 'lucide-react';

export function QuickActions({ pendingPayout }: { pendingPayout: boolean }) {
    return (
        <div className="grid grid-cols-4 gap-2 mb-6">
            <Link href="/catalog?share=true" className="flex flex-col items-center gap-2 p-2 active:opacity-70 transition">
                <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center text-purple-700 shadow-sm">
                    <Share2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">Compartir<br />Catálogo</span>
            </Link>

            <Link href="/dashboard/orders/new" className="flex flex-col items-center gap-2 p-2 active:opacity-70 transition">
                <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-700 shadow-sm">
                    <PlusCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">Nuevo<br />Pedido</span>
            </Link>

            <Link href="/dashboard/payouts" className="flex flex-col items-center gap-2 p-2 active:opacity-70 transition">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm relative ${pendingPayout ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    <DollarSign className="w-6 h-6" />
                    {pendingPayout && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
                </div>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">Mis<br />Ganancias</span>
            </Link>

            <Link href="/dashboard/notifications" className="flex flex-col items-center gap-2 p-2 active:opacity-70 transition">
                <div className="bg-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center text-orange-700 shadow-sm">
                    <Bell className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">Alertas</span>
            </Link>
        </div>
    );
}
