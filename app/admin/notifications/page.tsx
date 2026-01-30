
import prisma from '@/lib/prisma';
import { Bell, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
    const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { order: true }
    });

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Log de Notificaciones (WhatsApp)
            </h1>

            <div className="bg-white dark:bg-[#112114] rounded-xl shadow border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Receptor</th>
                            <th className="px-6 py-4">Mensaje (Preview)</th>
                            <th className="px-6 py-4">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {notifications.map((notif) => (
                            <tr key={notif.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                    {format(new Date(notif.createdAt), 'dd/MM HH:mm', { locale: es })}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-purple-600 font-bold">
                                    {notif.type}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="block font-bold text-gray-900 dark:text-white">{notif.recipientType}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{notif.recipientId.slice(0, 8)}...</span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={notif.message}>
                                    {notif.message}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex w-fit items-center gap-1 ${notif.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {notif.status === 'SENT' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {notif.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
