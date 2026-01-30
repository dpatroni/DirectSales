
import { Order, OrderItem } from '@prisma/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderListProps {
    orders: (Order & { items: OrderItem[] })[];
}

export function OrderList({ orders }: OrderListProps) {
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <p>No tienes pedidos recibidos aún.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                {/* Initials Avatar */}
                                <div className="size-11 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500 font-bold border border-pink-200 dark:border-pink-800">
                                    {order.clientName ? order.clientName.substring(0, 2).toUpperCase() : 'CL'}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[#0e1b10] dark:text-white flex items-center gap-1">
                                        {order.clientName || 'Cliente Anónimo'}
                                        {order.status === 'DRAFT' && (
                                            <span className="size-2 rounded-full bg-pink-500 animate-pulse"></span>
                                        )}
                                    </h4>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        {/* WhatsApp Icon */}
                                        <svg className="size-3 text-whatsapp" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path></svg>
                                        {order.clientPhone || 'Sin teléfono'}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-gray-400">
                                    {format(new Date(order.createdAt), 'HH:mm', { locale: es })}
                                </span>
                            </div>
                        </div>

                        {/* Items Summary */}
                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 mb-4">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Items:</p>
                            <p className="text-xs text-gray-500 line-clamp-1">
                                {order.items.map(i => `${i.quantity}x ${i.nameSnapshot}`).join(', ')}
                            </p>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200/50 dark:border-white/5">
                                <span className="text-xs font-medium text-gray-400">Total:</span>
                                <span className="text-sm font-bold text-[#0e1b10] dark:text-white">
                                    S/ {Number((order as any).total).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <a
                            href={`https://wa.me/${order.clientPhone?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-whatsapp hover:bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
                        >
                            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path></svg>
                            Gestionar en WhatsApp
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
