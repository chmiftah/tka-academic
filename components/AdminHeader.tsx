"use client";

import React from "react";
import { Menu, Bell, User } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
    title?: string;
}

export default function AdminHeader({ onMenuClick, title = "Admin Dashboard" }: HeaderProps) {
    return (
        <header className="bg-white shadow-sm border-b border-slate-200 h-16 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-600 lg:hidden hover:bg-slate-100 rounded-md"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-700">Admin User</p>
                        <p className="text-xs text-slate-500">Administrator</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white shadow-md">
                        <User className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </header>
    );
}
