'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Admin Dashboard Error:', error);
    }, [error]);

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-gray-200 m-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal en el Dashboard</h2>
            <p className="text-gray-600 mb-6 max-w-md">
                No pudimos cargar los datos del resumen. Esto puede deberse a un problema de conexión temporal o mantenimiento.
            </p>

            {/* Dev Error Details (Hidden in Prod usually, but helpful for debugging now) */}
            <div className="mb-6 w-full max-w-lg overflow-hidden bg-gray-900 text-red-300 p-4 rounded text-xs text-left font-mono">
                <p className="font-bold text-white border-b border-gray-700 pb-2 mb-2">Detalles Técnicos:</p>
                <p>{error.message || "Error desconocido"}</p>
                {error.digest && <p className="mt-2 text-gray-500">Digest: {error.digest}</p>}
            </div>

            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-orange-700 transition"
            >
                Intentar de nuevo
            </button>
        </div>
    );
}
