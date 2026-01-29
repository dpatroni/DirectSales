'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

export default function LoginPage() {
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setMessage('Error: ' + error.message)
        } else {
            setMessage('¡Enlace mágico enviado! Revisa tu correo.')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Soy Consultora</h1>
                <p className="text-gray-500 text-center mb-6">Ingresa tu email registrado para acceder.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="consultora@natura.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-70 flex justify-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Enlace Mágico'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm text-center ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message}
                    </div>
                )}
            </div>

            {/* DEBUG SECTION - REMOVE AFTER FIX */}
            <div className="mt-8 p-4 bg-gray-100 rounded text-xs font-mono text-gray-600 max-w-md w-full break-all">
                <p className="font-bold border-b mb-2">Debug Info (Vercel):</p>
                <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ ' + process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 15) + '...' : '❌ MISSING'}</p>
                <p>KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5) + '... (Length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : '❌ MISSING'}</p>
            </div>
            {/* END DEBUG */}
        </div>
    )
}
