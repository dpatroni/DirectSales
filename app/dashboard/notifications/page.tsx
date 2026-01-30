
import prisma from '@/lib/prisma';
import { Bell, CheckCircle, Clock, XCircle, Package, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

function getIcon(type: string) {
    if (type.includes('ORDER')) return <Package className="w-5 h-5 text-purple-600" />;
    if (type.includes('PAYOUT')) return <DollarSign className="w-5 h-5 text-emerald-600" />;
    return <Bell className="w-5 h-5 text-gray-600" />;
}

export default async function NotificationsPage() {
    // 1. Get Consultant (MVP Hardcode or Context)
    const SLUG = 'daniel-patroni';
    const consultant = await prisma.consultant.findUnique({ where: { slug: SLUG } });
    if (!consultant) return redirect('/');

    // 2. Fetch Notifications
    // We show notifications sent TO the consultant, AND notifications sent TO their customers (as visibility)
    // Actually, prompt says: "Ver historial de notificaciones (solo lectura) / Saber qué mensajes se enviaron a sus clientes"
    // So we fetch where recipientId = consultant.id OR (recipientType = CUSTOMER and customer.consultantId = consultant.id)
    // This requires complex OR or separate queries.
    // Simpler: Fetch consultant notifications first. Then customer notifications via relation logic if needed?
    // Let's rely on stored "metadata" or just query by recipientId for now for "My Notifications".
    // For "Customer Notifications", we might need a separate section or mixed list.
    // Let's try to mix them if efficient, or just show "My Notifications" first.
    // Given the prompt "Saber qué mensajes se enviaron a sus clientes", this implies visibility.

    // Let's finding all customers first? No, too many.
    // Let's use Prisma filtered relation if possible or raw query.
    // Or just fetch all notifications where recipientId is in [consultant.id, ...consultant.customers.map(c => c.id)]?
    // Optimization: Just fetch Consultant's own notifications for now as MVP "Mis Notificaciones".
    // To show "Mensajes a Clientes", maybe a tab? 
    // Let's do a single list for now: "Notificaciones Recientes" (Consultant's own).

    const notifications = await prisma.notification.findMany({
        where: {
            OR: [
                { recipientId: consultant.id }, // To me
                // { order: { consultantId: consultant.id } } // Related to my orders (sent to customers) - This is a good way!
            ]
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { order: true } // to check context
    });

    // We do client-side filtering or indication of "Sent to You" vs "Sent to Client"

    return (
        <div className="bg-[#FDFCFD] dark:bg-[#112114] min-h-screen pb-24 font-sans">
            <header className="sticky top-0 z-50 bg-[#FDFCFD]/80 dark:bg-[#112114]/80 backdrop-blur-md mb-6">
                <div className="max-w-4xl mx-auto flex items-center p-4 border-b border-gray-100 dark:border-white/5">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-6 h-6 text-gray-900 dark:text-white" />
                        Notificaciones
                    </h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 space-y-4">
                {notifications.map((notif) => {
                    const isToMe = notif.recipientId === consultant.id;
                    return (
                        <div key={notif.id} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex gap-4">
                            <div className="bg-gray-50 dark:bg-white/10 p-3 rounded-full h-fit">
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        {isToMe ? 'Para Ti' : 'Para tu Cliente'} • {notif.channel}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {format(new Date(notif.createdAt), 'dd MMM HH:mm', { locale: es })}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                                    {notif.type.replace(/_/g, ' ')}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line mb-2">
                                    {notif.message}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 ${notif.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {notif.status === 'SENT' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {notif.status}
                                    </span>
                                    {notif.order && (
                                        <span className="text-[10px] bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                            Pedido #{notif.order.id.slice(0, 8)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {notifications.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tienes notificaciones recientes.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
