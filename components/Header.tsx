"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, User, LogOut, ChevronDown, ChevronRight, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/auth/actions";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const pageTitle = pathname.split("/").filter(Boolean).pop();
    const displayTitle = pageTitle ? pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1) : "Dashboard";

    return (
        <header className="h-16 bg-white border-b border-transparent px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">

            {/* Left: Menu & Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl lg:text-2xl font-medium text-slate-800 tracking-tight">
                    {displayTitle}
                </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* Search - Desktop Optional */}
                <div className="hidden md:flex items-center h-10 px-4 bg-slate-50 rounded-full border border-transparent hover:border-slate-200 hover:bg-white transition-all w-64 text-slate-600">
                    <Search className="w-4 h-4 mr-2 opacity-50" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-slate-400"
                    />
                </div>

                <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>

                {/* Notifications */}
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* Profile Avatar */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-transparent hover:ring-indigo-100 transition-all focus:outline-none"
                    >
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold text-sm">
                            {(user?.email?.[0] || "S").toUpperCase()}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-[20px] shadow-lg border border-slate-100 p-2 z-50 transform origin-top-right animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                                <p className="text-xs text-slate-500">Student Account</p>
                            </div>
                            <div className="space-y-1">
                                <Link
                                    href="/profile"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors"
                                >
                                    <User className="w-4 h-4" /> Profile
                                </Link>
                                <button
                                    onClick={() => logout()}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4" /> Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
