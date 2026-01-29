import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Handle Root Redirection (Unchanged)
    if (pathname === '/') {
        const consultantSlug = request.cookies.get('consultant_slug')?.value;
        if (consultantSlug) {
            return NextResponse.redirect(new URL(`/${consultantSlug}`, request.url));
        }
    }

    try {
        // 2. Initialize Supabase Response
        const { response, supabase } = await updateSession(request);

        // If Supabase failed to init (missing env vars), allow request but log it.
        if (!supabase) {
            console.warn('⚠️ Middleware: Supabase client not initialized (Missing Env Vars). Proceeding as Guest.');
            return response;
        }

        // 3. Admin Route Protection
        if (pathname.startsWith('/admin')) {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }

        // 4. Consultant Slug Persistence
        const isPublicRoute = !pathname.startsWith('/_next') &&
            !pathname.startsWith('/api') &&
            !pathname.startsWith('/cart') &&
            !pathname.startsWith('/checkout') &&
            !pathname.startsWith('/history') &&
            !pathname.startsWith('/profile') &&
            !pathname.startsWith('/login') &&
            !pathname.startsWith('/auth') &&
            !pathname.includes('.');

        if (isPublicRoute && pathname !== '/') {
            const slug = pathname.split('/')[1];
            if (slug && response.cookies) { // Check if cookies exist on response
                response.cookies.set('consultant_slug', slug, {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                });
            }
        }

        return response;

    } catch (e) {
        console.error('🔥 Middleware Implementation Error:', e);
        // Fallback: Proceed without doing anything to avoid white screen
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
