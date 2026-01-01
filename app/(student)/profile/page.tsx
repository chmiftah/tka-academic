import React from 'react';
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const supabase = await createClient();

    // 1. Get Auth User
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    // 2. Get User Role (Optional, from public table if needed, or metadata)
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();

    const email = user.email || "-";
    const name = email.split('@')[0];
    const initial = name.charAt(0).toUpperCase();
    const role = profile?.role || "STUDENT";

    return (
        <div className="p-6 lg:p-10 min-h-screen space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Profil Saya</h1>
                <p className="text-slate-500 mt-2">Kelola informasi akun dan preferensi Anda.</p>
            </header>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-12 mb-6">
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                            <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 uppercase">
                                {initial + initial}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 capitalize">{name}</h2>
                            <p className="text-slate-500 text-sm font-medium bg-slate-100 inline-block px-2 py-1 rounded mt-1">{role}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <div className="text-slate-900">{email}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status Akun</label>
                                <div className="text-green-600 font-medium">Aktif</div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Edit Profil (Coming Soon)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
