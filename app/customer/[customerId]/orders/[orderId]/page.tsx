
import { getCustomerOrder, verifyCustomerAccess } from '@/app/actions/customer-portal';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Package, CreditCard, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import RepeatOrderButton from '@/components/customer/RepeatOrderButton';

export const dynamic = 'force-dynamic';

function getStatusColor(status: string) { // For Headers
    const s = status.toUpperCase();
    if (s === 'PENDING') return 'bg-yellow-500';
    if (s === 'CONFIRMED') return 'bg-blue-500';
    if (s === 'IN_TRANSIT') return 'bg-purple-600';
    if (s === 'DELIVERED') return 'bg-green-600';
    if (s === 'CANCELED') return 'bg-red-500';
    return 'bg-gray-500';
}

function getStatusLabel(status: string) {
    const map: any = {
        'PENDING': 'Pendiente de Confirmación',
        'CONFIRMED': 'Pedido Confirmado',
        'ORDERED_TO_BRAND': 'Solicitado a Marca',
        'IN_TRANSIT': 'En Camino',
        'DELIVERED': 'Entregado',
        'CANCELED': 'Cancelado'
    };
    return map[status] || status;
}

export default async function OrderDetailPage({ params }: { params: Promise<{ customerId: string, orderId: string }> }) {
    const { customerId, orderId } = await params;

    const customer = await verifyCustomerAccess(customerId);
    if (!customer) return notFound();

    const order = await getCustomerOrder(customerId, orderId);
    if (!order) return notFound();

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header with Dynamic Color */}
            <div className={`${getStatusColor(order.status)} text-white p-6 pb-12`}>
                <div className="flex items-center gap-4 mb-6">
                    <Link href={`/customer/${customerId}/orders`} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-lg">Detalle del Pedido</h1>
                </div>

                <div className="text-center">
                    <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-medium mb-2 uppercase tracking-wide">
                        {order.status}
                    </div>
                    <h2 className="text-3xl font-bold mb-1">S/ {Number(order.total).toFixed(2)}</h2>
                    <p className="opacity-80 text-sm">
                        {format(new Date(order.createdAt), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                </div>
            </div>

            <main className="-mt-6 px-4 max-w-lg mx-auto space-y-4">

                {/* Status Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        Estado del Pedido
                    </h3>
                    <div className="pl-2 border-l-2 border-gray-100 py-1">
                        <p className="text-lg font-medium text-gray-800">{getStatusLabel(order.status)}</p>
                        <p className="text-sm text-gray-500">
                            Última actualización: {format(new Date(order.updatedAt), "HH:mm a", { locale: es })}
                        </p>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-sm">Productos ({order.items.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {order.items.map((item) => (
                            <div key={item.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900 text-sm">{item.quantity}x</span>
                                        <span className="text-gray-700 text-sm">{item.nameSnapshot}</span>
                                    </div>
                                    {(item.selectedVariant as any)?.name && (
                                        <p className="text-xs text-gray-400 pl-6">
                                            Variante: {(item.selectedVariant as any).name}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-gray-900 text-sm">S/ {(Number(item.finalPrice) * item.quantity).toFixed(2)}</span>
                                    {Number(item.finalPrice) < Number(item.unitPrice) && (
                                        <span className="block text-[10px] text-gray-400 line-through">
                                            S/ {(Number(item.unitPrice) * item.quantity).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>S/ {Number(order.subtotal).toFixed(2)}</span>
                        </div>
                        {Number(order.discountTotal) > 0 && (
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                <span>Ahorro</span>
                                <span>- S/ {Number(order.discountTotal).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Total</span>
                            <span>S/ {Number(order.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Consultant Info */}
                <div className="bg-white rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        ¿Necesitas Ayuda?
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                            <span className="text-purple-700 font-bold text-lg">
                                {order.consultant.name.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{order.consultant.name}</p>
                            <p className="text-xs text-gray-500">Tu Consultora</p>
                        </div>
                        <a href={`https://wa.me/${order.consultant.phone}`} target="_blank" className="ml-auto bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3" /> WhatsApp
                        </a>
                    </div>
                </div>

                {/* Repeat Order Action */}
                <div className="pt-4 sticky bottom-4 z-10">
                    <RepeatOrderButton customerId={customerId} orderId={orderId} />
                </div>

            </main>
        </div>
    );
}
