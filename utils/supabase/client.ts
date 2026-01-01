import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        // Return a dummy client or throw a clearer error if needed, 
        // but for build safety, we can just throw if strictly needed, 
        // or return null/mock if we want to bypass during static gen.
        // However, standard Next.js apps usually require these.
        if (typeof window === 'undefined') {
            // Server-side / Build time fallback?
            // Actually, createBrowserClient is for browser.
        }
        throw new Error("Supabase URL and Anon Key are required!");
    }

    return createBrowserClient(url, key);
}
