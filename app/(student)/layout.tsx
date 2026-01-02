import React from "react";
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { createClient } from "@/utils/supabase/server";
import { Level } from "@/types";
import StudentLayoutClient from "./StudentLayoutClient";

// Fetch Levels Server-Side
async function getLevels(): Promise<Level[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('levels')
        .select('id, name')
        .order('name');

    if (error) {
        console.error("Fetch Levels Error:", error);
        return [];
    }
    return data || [];
}

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
    const levels = await getLevels();

    return (
        <StudentLayoutClient levels={levels}>
            {children}
        </StudentLayoutClient>
    );
}
