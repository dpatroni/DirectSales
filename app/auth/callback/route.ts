import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Default redirect to /profile if no 'next' param provided
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user) {
            try {
                // 1. Check/Link Admin
                let admin = await prisma.admin.findUnique({
                    where: { authId: user.id }
                })

                if (!admin && user.email) {
                    // Try finding by email to link
                    const existingAdmin = await prisma.admin.findUnique({
                        where: { email: user.email }
                    })
                    if (existingAdmin) {
                        admin = await prisma.admin.update({
                            where: { id: existingAdmin.id },
                            data: { authId: user.id }
                        })
                    }
                }

                if (admin) {
                    return NextResponse.redirect(`${origin}/admin`)
                }

                // 2. Check/Link Consultant
                let consultant = await prisma.consultant.findUnique({
                    where: { authId: user.id }
                })

                if (!consultant && user.email) {
                    // Try finding by email to link
                    const existingConsultant = await prisma.consultant.findFirst({
                        where: { email: user.email }
                    })
                    if (existingConsultant) {
                        consultant = await prisma.consultant.update({
                            where: { id: existingConsultant.id },
                            data: { authId: user.id }
                        })
                    }
                }

                if (consultant) {
                    // Check Onboarding Status
                    if (consultant.primaryBrandId && consultant.phone) {
                        // Onboarding Complete -> Go to Catalog
                        return NextResponse.redirect(`${origin}/${consultant.slug}`)
                    } else {
                        // Onboarding Incomplete -> Go to Wizard
                        return NextResponse.redirect(`${origin}/onboarding`)
                    }
                }

                // 3. Guest/Client -> Home or original destination
                return NextResponse.redirect(`${origin}${next}`)

            } catch (e) {
                console.error('Auth Callback Error:', e)
                return NextResponse.redirect(`${origin}/login?error=server_error`)
            }
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}
