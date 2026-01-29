'use client';

import { createConsultant } from '@/app/admin/actions';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useTransition } from 'react';

export default function NewConsultantPage() {
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            try {
                await createConsultant(formData);
            } catch (error) {
                alert('Error al crear consultora. Verifique los datos.');
            }
        });
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/consultants" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver a Consultoras
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Consultora</h1>

            <form action={createConsultant} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input name="name" type="text" required className="w-full border rounded-md px-3 py-2" placeholder="Ej. Ana García" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Para Login)</label>
                        <input name="email" type="email" required className="w-full border rounded-md px-3 py-2" placeholder="ana@ejemplo.com" />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Pública)</label>
                        <input name="slug" type="text" required className="w-full border rounded-md px-3 py-2" placeholder="ana-garcia" />
                        <p className="text-xs text-gray-500 mt-1">Será: natura.com/ana-garcia</p>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
                        <input name="phone" type="tel" className="w-full border rounded-md px-3 py-2" placeholder="+51 999 999 999" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Mensaje de Bienvenida</label>
                        <textarea name="bio" rows={3} className="w-full border rounded-md px-3 py-2" placeholder="¡Hola! Soy consultora Natura..." />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Guardar Consultora
                    </button>
                </div>
            </form>
        </div>
    );
}
