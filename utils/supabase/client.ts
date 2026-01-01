import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        // During build/prerender (server-side), we might not have env vars if not configured in build environment.
        // Don't crash the build.
        if (typeof window === 'undefined') {
            console.warn("Supabase Env Vars missing during server-side render. Returning dummy client.");
            // Return a dummy object explicitly cast as any to suppress type errors during build
            // This method shouldn't be called for data fetching during prerender anyway if properly placed in useEffect
            return {
                from: () => ({ select: () => ({ data: [], error: null }) }),
                auth: { getUser: () => ({ data: { user: null }, error: null }) }
            } as any;
        }

        // In browser, this is critical.
        throw new Error("Supabase URL and Anon Key are required!");
    }

    return createBrowserClient(url, key);
}
