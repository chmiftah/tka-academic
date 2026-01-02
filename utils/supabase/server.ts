import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If environment variables are missing (e.g. during build step), return a dummy client or throw specific error
    if (!url || !key) {
        // If we are just building, we might not have the env vars. 
        // We can return a mock client or null, but type safety is tricky.
        // Better to check if we are in a browser-like or safely ignore.
        // Actually, createServerClient won't work without them. 
        // Let's fallback to empty strings if missing, BUT logging a warning.
        // This usually happens during `next build` static generation.
        console.warn('Supabase Env Vars missing in server client. Using potentially unsafe defaults for build.')
    }

    return createServerClient(
        url || '',
        key || '',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component. 
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
            },
        }
    )
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for Admin Client!");
    }

    return createSupabaseClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
