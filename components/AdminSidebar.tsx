"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Files,
    Database,
    User,
    LogOut,
    Settings,
    X,
    ChevronRight,
    ChevronLeft,
    Layers
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export default function AdminSidebar({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname.startsWith(path);

    const menuGroups = [
        {
            title: "Manajemen Akademik",
            items: [
                { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { href: "/admin/levels", label: "Data Jenjang", icon: Layers },
                { href: "/admin/paket-soal", label: "Paket Soal", icon: Files },
                { href: "/admin/mapel", label: "Mata Pelajaran", icon: BookOpen },
                { href: "/admin/questions", label: "Bank Soal", icon: Database },
            ]
        },
        {
            title: "Pengaturan",
            items: [
                { href: "/admin/users", label: "Pengguna", icon: User },
                { href: "/admin/settings", label: "Sistem", icon: Settings },
            ]
        }
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-300 shadow-xl transition-all duration-300 ease-spring
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${isCollapsed ? "w-20" : "w-64"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-800 transition-all`}>
                        {!isCollapsed ? (
                            <span className="text-xl font-bold text-white tracking-wide">TKA Admin</span>
                        ) : (
                            <span className="text-xl font-bold text-white">TKA</span>
                        )}
                        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
                        {menuGroups.map((group, idx) => (
                            <div key={idx}>
                                {!isCollapsed && (
                                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        {group.title}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const active = isActive(item.href);
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={onClose}
                                                title={isCollapsed ? item.label : undefined}
                                                className={`
                                                    group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
                                                    ${active
                                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                                                        : "hover:bg-slate-800 hover:text-white"
                                                    }
                                                    ${isCollapsed ? "justify-center" : ""}
                                                `}
                                            >
                                                <Icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                                                {!isCollapsed && <span>{item.label}</span>}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800">
                        <button
                            className={`flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-md transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? "Keluar" : undefined}
                        >
                            <LogOut className="w-5 h-5 shrink-0" />
                            {!isCollapsed && <span>Keluar</span>}
                        </button>

                        {/* Toggle */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden lg:flex mt-4 items-center justify-center p-2 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors w-full"
                        >
                            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
