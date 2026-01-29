import { getCurrentShoppingConsultant } from '@/app/actions';
import { Header } from '@/components/layout/Header';
import { User, Phone, Mail, Instagram, Facebook, MessageCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export default async function ProfilePage() {
    // 1. Check Authentication (Consultant View)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Logged in as Consultant
        let consultant = await prisma.consultant.findUnique({
            where: { authId: user.id },
        });

        // Auto-Link Logic
        if (!consultant && user.email) {
            const existingConsultant = await prisma.consultant.findUnique({
                where: { email: user.email },
            });

            if (existingConsultant) {
                consultant = await prisma.consultant.update({
                    where: { id: existingConsultant.id },
                    data: { authId: user.id },
                });
            }
        }

        if (consultant) {
            return (
                <div className="min-h-screen bg-gray-50 pb-20 p-4">
                    <div className="flex justify-between items-center mb-6 mt-4">
                        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil Consultora</h1>
                        <Link href="/" className="text-sm text-primary font-bold">Ir a Catálogo</Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={consultant.avatarUrl || `https://ui-avatars.com/api/?name=${consultant.name}&background=F48221&color=fff`}
                                alt={consultant.name}
                                className="w-16 h-16 rounded-full border-2 border-primary"
                            />
                            <div>
                                <h2 className="text-xl font-bold">{consultant.name}</h2>
                                <p className="text-gray-500 text-sm">{consultant.email}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100 mb-4">
                            <strong>Tu Link Público:</strong>
                            <p className="font-mono mt-1 text-xs break-all bg-white p-2 rounded border border-orange-200">
                                {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/{consultant.slug}
                            </p>
                        </div>

                        <Link href={`/${consultant.slug}`} className="block w-full text-center bg-primary text-white py-2 rounded-lg font-bold mb-4">
                            Ver Mi Tienda
                        </Link>
                    </div>

                    <form action={async () => {
                        'use server';
                        const sb = await createClient();
                        await sb.auth.signOut();
                        redirect('/login');
                    }}>
                        <button className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 transition">
                            <LogOut className="w-5 h-5" />
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            );
        } else {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4">
                    <p className="text-red-500 mb-4">Correo no registrado como consultora ({user.email}).</p>
                    <form action={async () => {
                        'use server';
                        const sb = await createClient();
                        await sb.auth.signOut();
                        redirect('/login');
                    }}>
                        <button className="text-gray-500 underline">Cerrar Sesión</button>
                    </form>
                </div>
            )
        }
    }

    // 2. Guest View (Shopping with Consultant)
    const consultant = await getCurrentShoppingConsultant();

    if (!consultant) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <User className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-700">No hay consultora seleccionada</h2>
                    <p className="text-gray-500 mb-6">Selecciona una consultora navegando a su enlace o catálogo.</p>
                    <Link href="/login" className="text-primary font-bold hover:underline mb-4">
                        Soy Consultora (Login)
                    </Link>
                    <Link href="/" className="bg-primary text-white px-6 py-2 rounded-full font-bold">
                        Ir al Catálogo Generico
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header consultantName={consultant.name} />

            <main className="container mx-auto px-4 py-8 max-w-lg">
                <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
                    <div className="h-24 bg-gradient-to-r from-orange-400 to-primary"></div>

                    <div className="px-6 pb-6 text-center -mt-12">
                        <div className="relative w-24 h-24 mx-auto rounded-full border-4 border-white overflow-hidden bg-gray-200">
                            {consultant.avatarUrl ? (
                                <img src={consultant.avatarUrl} alt={consultant.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                    <User className="w-10 h-10" />
                                </div>
                            )}
                        </div>

                        <h1 className="mt-3 text-2xl font-bold text-gray-900">{consultant.name}</h1>
                        <p className="text-gray-500 font-medium">Consultora Natura</p>

                        {consultant.bio && (
                            <p className="mt-4 text-sm text-gray-600 italic">
                                "{consultant.bio}"
                            </p>
                        )}

                        <div className="mt-6 flex flex-col gap-3">
                            {consultant.phone && (
                                <a
                                    href={`https://wa.me/${consultant.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-2.5 rounded-lg font-bold hover:bg-green-600 transition"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Contactar por WhatsApp
                                </a>
                            )}

                            {consultant.email && (
                                <a
                                    href={`mailto:${consultant.email}`}
                                    className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
                                >
                                    <Mail className="w-5 h-5" />
                                    Enviar Email
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600">
                        ¿Eres Consultora? Acceso Privado
                    </Link>
                </div>
            </main>
        </div>
    );
}
