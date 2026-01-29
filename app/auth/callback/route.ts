import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Default redirect to /profile if no 'next' param provided
    const next = searchParams.get('next') ?? '/profile'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return the user to an error page with instructions
    // For now, redirect to login with error param
    return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}
