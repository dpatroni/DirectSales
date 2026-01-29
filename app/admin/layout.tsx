import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
// import { LayoutDashboard, Users, Repeat, LogOut, Shield, BadgeCheck, Package } from 'lucide-react'; 
// Commenting out icons to rule out dependency issues for now.
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let debugInfo = [];

    try {
        debugInfo.push("Starting Admin Layout");

        debugInfo.push(" Creating Supabase Client...");
        const supabase = await createClient();

        debugInfo.push(" Getting User...");
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            debugInfo.push(` Auth Error: ${authError.message}`);
            throw new Error(`Auth Error: ${authError.message}`);
        }

        if (!authUser) {
            debugInfo.push(" No User found. Attempting Redirect to /login...");
            // Intentionally NOT redirecting yet to see the log
            throw new Error("REDIRECT_NEEDED: /login");
        }

        debugInfo.push(` User found: ${authUser.email} (${authUser.id})`);

        debugInfo.push(" Checking DB Admin...");
        const admin = await prisma.admin.findUnique({
            where: { authId: authUser.id },
        });

        if (!admin) {
            debugInfo.push(" Admin not found in DB by AuthID.");

            if (authUser.email === 'dpatroniv@gmail.com') {
                debugInfo.push(" Emergency Override for dpatroniv@gmail.com");
                // Allow access
            } else {
                debugInfo.push(" Access Denied.");
                return (
                    <div className="p-10 text-center">
                        <h1 className="text-red-500 font-bold">Acceso Denegado</h1>
                        <p>Debug Log:</p>
                        <pre className="text-left bg-gray-100 p-2 text-xs mt-4">
                            {debugInfo.join('\n')}
                        </pre>
                    </div>
                )
            }
        } else {
            debugInfo.push(" Admin verified in DB.");
        }

    } catch (error: any) {
        // CATCH ALL - NO RETHROW
        const msg = error.message || JSON.stringify(error);

        return (
            <div className="min-h-screen bg-white p-10 font-mono">
                <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 DIAGNOSTIC MODE 🚨</h1>

                <div className="mb-6">
                    <h2 className="font-bold border-b mb-2">Error Message:</h2>
                    <p className="bg-red-50 p-4 border border-red-200 text-red-900 rounded">
                        {msg}
                    </pre>
                </div>

                <div>
                    <h2 className="font-bold border-b mb-2">Execution Log:</h2>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-auto">
                        {debugInfo.join('\n')}
                    </pre>
                </div>

                <div className="mt-8">
                    <p className="text-gray-500 text-sm">
                        *Si el error dice "REDIRECT_NEEDED", el sistema está intentando redirigir pero lo hemos pausado para verificar que no sea un bucle.*
                    </p>
                    <a href="/login" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">
                        Ir a Login manualmente
                    </a>
                </div>
            </div>
        );
    }

    // Happy Path
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <div className="bg-yellow-100 p-2 text-center text-xs font-bold text-yellow-800">
                🔧 MODO DEBUG ACTIVO
            </div>
            {/* Simple Layout for now */}
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <span className="font-bold text-lg">Natura Admin (Debug)</span>
                <span className="text-sm text-gray-500">Sesión Activa</span>
            </header>
            <main className="p-8">
                {children}
            </main>
        </div>
    );
}
