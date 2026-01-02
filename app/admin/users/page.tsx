import { createAdminClient } from "@/utils/supabase/server";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const supabase = await createAdminClient();

    // Fetch from 'profiles' table as requested
    // This table contains id, email, full_name, role, created_at
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching profiles:", error);
    }

    return (
        <UsersClient initialUsers={profiles || []} />
    );
}
