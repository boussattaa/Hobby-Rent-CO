
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/inbox',
    '/list-your-gear',
    '/my-listings',
    '/earnings',
    '/rentals',
    '/account',
    '/verify',
    '/edit-listing',
    '/manage-availability',
]

export async function middleware(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protect private routes
    const pathname = request.nextUrl.pathname
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

    if (isProtected && !user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect_to', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images/ (public images)
         */
        '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
