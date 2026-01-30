
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ConsultantBottomNav } from '@/components/layout/ConsultantBottomNav';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // 1. Verify Auth
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // 2. Verify Consultant Role
    // We check if this Auth ID is linked to a Consultant
    const consultant = await prisma.consultant.findFirst({
        where: {
            OR: [
                { authId: user.id },
                { email: user.email } // Failover/Auto-link check
            ]
        }
    });

    if (!consultant) {
        // Logged in but not a consultant (e.g. Admin or simple Customer if logic changes)
        // For now, redirect to root or show error
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Cuenta no autorizada</h2>
                    <p className="text-gray-500 mb-6">Tu usuario ({user.email}) no está registrado como Consultora.</p>
                    <form action={async () => {
                        'use server';
                        const sb = await createClient();
                        await sb.auth.signOut();
                        redirect('/login');
                    }}>
                        <button className="w-full bg-red-100 text-red-700 font-bold py-3 rounded-xl hover:bg-red-200 transition">
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Auto-link if needed
    if (consultant.authId !== user.id) {
        await prisma.consultant.update({
            where: { id: consultant.id },
            data: { authId: user.id }
        });
    }

    return (
        <section className="bg-[#FDFCFD] min-h-screen text-slate-900 pb-24">
            {children}
            <ConsultantBottomNav />
        </section>
    )
}
