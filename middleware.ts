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

    // 2. Initialize Supabase Response
    // This refreshes the session and sets up the response with auth cookies
    const { response } = await updateSession(request);

    // 3. Admin Route Protection
    if (pathname.startsWith('/admin')) {
        const { user } = await updateSession(request);

        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        // Strict Role Check handled in Layout
    }

    // 4. Handle Consultant Slug Persistence
    // Regex to match typical slug (not starting with _next, api, etc)
    const isPublicRoute = !pathname.startsWith('/_next') &&
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/cart') &&
        !pathname.startsWith('/checkout') &&
        !pathname.startsWith('/history') &&
        !pathname.startsWith('/profile') &&
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/auth') &&
        !pathname.includes('.'); // avoid files

    // Simple heuristic: If it's a top-level path that is NOT a reserved route, assume it's a consultant slug
    if (isPublicRoute && pathname !== '/') {
        const slug = pathname.split('/')[1];
        if (slug) {
            response.cookies.set('consultant_slug', slug, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });
        }
    }

    return response;
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
