import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // --- DEBUGGING START ---
    console.log(`[Middleware] Path: ${request.nextUrl.pathname}`);
    console.log(`[Middleware] Cookies: ${request.cookies.getAll().length}`);
    console.log(`[Middleware] User: ${user?.id || 'NO USER'}`);
    // --- DEBUGGING END ---

    // Protected routes pattern
    const protectedPaths = ["/dashboard", "/exam", "/result", "/admin"];
    const isProtectedRoute = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    // Redirect logic
    if (!user && isProtectedRoute) {
        console.warn(`[Middleware] BLOCKED: No user for protected route: ${request.nextUrl.pathname}`);
        // TEMPORARILY DISABLED FOR DEBUGGING
        // const url = request.nextUrl.clone();
        // url.pathname = "/login";
        // return NextResponse.redirect(url);
    }

    if (user && (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register"))) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // Role-based access control for /admin
    if (user && request.nextUrl.pathname.startsWith("/admin")) {
        // Fetch user role from 'users' table (assuming public table synced with auth)
        // Using email for lookup based on provided screenshot context
        const { data: dbUser } = await supabase
            .from("users")
            .select("role")
            .eq("email", user.email!)
            .single();

        // If no role found or role is not ADMIN, redirect to dashboard
        if (!dbUser || dbUser.role !== "ADMIN") {
            const url = request.nextUrl.clone();
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
