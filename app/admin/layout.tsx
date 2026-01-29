import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { LayoutDashboard, Users, Repeat, LogOut, Shield } from 'lucide-react';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // 1. Verify Admin Access
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check against Admin Table
    const admin = await prisma.admin.findUnique({
        where: { authId: user.id },
    });

    // Fallback: Check if email matches an admin (and link if needed, similar to consultant)
    if (!admin) {
        if (!user.email) redirect('/login'); // Should not happen if logged in

        const potentialAdmin = await prisma.admin.findUnique({
            where: { email: user.email },
        });

        if (potentialAdmin) {
            // Auto-Link
            await prisma.admin.update({
                where: { id: potentialAdmin.id },
                data: { authId: user.id }
            });
            // Continue (render children)
        } else {
            // Not an admin
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                        <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
                        <p className="text-gray-500 mb-4">Tu usuario ({user.email}) no tiene permisos de administrador.</p>
                        <form action={async () => {
                            'use server';
                            const sb = await createClient();
                            await sb.auth.signOut();
                            redirect('/login');
                        }}>
                            <button className="text-red-600 font-bold hover:underline">Cerrar Sesión</button>
                        </form>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    <span className="font-bold text-xl text-gray-900">Natura Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-primary rounded-lg transition font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/consultants" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-primary rounded-lg transition font-medium">
                        <Users className="w-5 h-5" />
                        Consultoras
                    </Link>
                    <Link href="/admin/cycles" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-primary rounded-lg transition font-medium">
                        <Repeat className="w-5 h-5" />
                        Ciclos
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-4 px-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                            A
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">Admin</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <form action={async () => {
                        'use server';
                        const sb = await createClient();
                        await sb.auth.signOut();
                        redirect('/login');
                    }}>
                        <button className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 transition text-sm">
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
