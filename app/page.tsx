import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-4 text-primary">DirectSales Platform</h1>
            <p className="mb-8 text-gray-600">Bienvenido.</p>
            <Link href="/connie-salas" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-orange-700 transition">
                Ver Catálogo de Connie Salas
            </Link>
        </main>
    );
}
