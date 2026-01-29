'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an analytics service
        console.error('🚨 Application Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <div className="bg-red-50 p-8 rounded-lg border border-red-200 shadow-sm max-w-md">
                <h2 className="text-2xl font-bold text-red-800 mb-4">¡Algo salió mal!</h2>

                <div className="bg-white p-4 rounded border border-red-100 mb-6 text-left overflow-auto max-h-40">
                    <p className="font-mono text-xs text-red-600 break-words">
                        {error.message || 'Error desconocido'}
                    </p>
                    {error.digest && (
                        <p className="font-mono text-xs text-gray-400 mt-2">
                            Digest: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="bg-red-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-900 transition"
                    >
                        Reintentar
                    </button>
                    <a href="/" className="text-red-800 px-6 py-2 rounded-lg font-bold hover:bg-red-100 transition flex items-center">
                        Ir al Inicio
                    </a>
                </div>

                <div className="mt-8 pt-4 border-t border-red-100 text-xs text-gray-500">
                    <p>Si eres el administrador:</p>
                    <ul className="list-disc list-inside mt-1 text-left">
                        <li>Verifica que <strong>DATABASE_URL</strong> esté configurada en Vercel.</li>
                        <li>Revisa los logs de Vercel para más detalles.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
