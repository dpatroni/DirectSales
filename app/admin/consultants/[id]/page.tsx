export default async function EditConsultantPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const consultant = await prisma.consultant.findUnique({
        where: { id: id }
    });

    if (!consultant) {
        redirect('/admin/consultants');
    }

    const updateWithId = updateConsultant.bind(null, consultant.id);

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/admin/consultants" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver a Consultoras
            </Link>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Editar Consultora</h1>
                <span className="text-xs text-gray-400 font-mono">{consultant.id}</span>
            </div>

            <form action={updateWithId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            name="name"
                            type="text"
                            required
                            defaultValue={consultant.name}
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            disabled
                            value={consultant.email || ''}
                            className="w-full border rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                            title="El email no se puede editar directamente ya que está vinculado al login"
                        />
                        <p className="text-xs text-gray-400 mt-1">El email no se puede cambiar aquí.</p>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL Pública)</label>
                        <input
                            name="slug"
                            type="text"
                            required
                            defaultValue={consultant.slug}
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                            name="phone"
                            type="tel"
                            defaultValue={consultant.phone || ''}
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                            name="bio"
                            rows={3}
                            defaultValue={consultant.bio || ''}
                            className="w-full border rounded-md px-3 py-2"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
}
