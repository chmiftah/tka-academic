"use client";

import React, { useState } from "react";
import {
    User,
    Shield,
    Calendar,
    Search,
    Mail,
    MoreVertical
} from "lucide-react";

interface ProfileData {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    created_at?: string;
}

interface UsersClientProps {
    initialUsers: ProfileData[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = initialUsers.filter(user =>
        (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.role?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans selection:bg-blue-100">

            {/* --- Header (Fixed) --- */}
            <header className="flex-none bg-white border-b border-slate-200 h-20 flex items-center justify-between px-6 z-30 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Daftar Pengguna</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Memuat data dari <span className="font-mono text-blue-600">profiles</span>
                    </p>
                </div>
                <div className="px-5 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100 shadow-sm">
                    {filteredUsers.length} Pengguna
                </div>
            </header>

            {/* --- Content Area (Internal Scroll) --- */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 scroll-smooth relative">
                <div className="max-w-6xl mx-auto space-y-8 pb-24">

                    {/* Search Bar (Floating) */}
                    <div className="sticky top-0 z-20 -mx-2 px-2 pb-4 pt-2 bg-slate-50/95 backdrop-blur-sm">
                        <div className="relative max-w-lg shadow-lg shadow-slate-200/50 rounded-full">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-blue-500" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-12 pr-6 py-4 border-0 rounded-full leading-5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm"
                                placeholder="Cari nama, email, atau role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Modern Table Card */}
                    <div className="bg-white rounded-[28px] shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-blue-50/50 border-b border-blue-100">
                                    <tr>
                                        <th scope="col" className="px-8 py-5 text-xs font-bold text-blue-800 uppercase tracking-wider">
                                            Pengguna
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-xs font-bold text-blue-800 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-xs font-bold text-blue-800 uppercase tracking-wider">
                                            Tanggal Bergabung
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-xs font-bold text-blue-800 uppercase tracking-wider text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <User className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-medium">Tidak ada pengguna ditemukan.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user, idx) => (
                                            <tr
                                                key={user.id || idx}
                                                className="group hover:bg-slate-50/80 transition-colors duration-200"
                                            >
                                                {/* User Info */}
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-11 w-11">
                                                            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-sm">
                                                                {user.full_name
                                                                    ? user.full_name.substring(0, 2).toUpperCase()
                                                                    : (user.email ? user.email.substring(0, 2).toUpperCase() : "?")
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="ml-5">
                                                            <div className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                                                {user.full_name || "Tanpa Nama"}
                                                            </div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                                                                <Mail className="w-3 h-3" />
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role Badge */}
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <span className={`
                                                        inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                        ${user.role === 'ADMIN'
                                                            ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm shadow-blue-100'
                                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                        }
                                                    `}>
                                                        {user.role === 'ADMIN' ? <Shield className="w-3 h-3 mr-1.5" /> : <User className="w-3 h-3 mr-1.5" />}
                                                        {user.role}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                            <Calendar className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-medium text-slate-600">
                                                            {user.created_at
                                                                ? new Date(user.created_at).toLocaleDateString("id-ID", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric"
                                                                })
                                                                : "-"
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-5 whitespace-nowrap text-right">
                                                    <button className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
