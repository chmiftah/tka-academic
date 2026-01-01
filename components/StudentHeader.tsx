"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Bell, User, LogOut, Settings, ChevronDown } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
}

export default function StudentHeader({ onMenuClick }: HeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 transition-all duration-300">
            {/* Left: Mobile Menu Trigger & Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-bold text-slate-800 hidden md:block">
                    Dashboard
                </h2>
                {/* Mobile Title */}
                <span className="text-lg font-bold text-slate-700 md:hidden">TKA Student</span>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notifications (Placeholder) */}
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative group">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1.5 pl-3 pr-2 rounded-full border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-sm transition-all group"
                    >
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">Student User</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">TKA-2024-001</span>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white shadow-md shadow-indigo-200">
                            <User className="w-4 h-4" />
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <div
                        className={`
                            absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 ring-1 ring-slate-200/50 
                            transform transition-all duration-200 origin-top-right
                            ${isProfileOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                        `}
                    >
                        <div className="p-2 border-b border-slate-50">
                            <div className="px-3 py-2">
                                <p className="text-sm font-bold text-slate-800">Student User</p>
                                <p className="text-xs text-slate-500">student@example.com</p>
                            </div>
                        </div>
                        <div className="p-1 space-y-0.5">
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <Settings className="w-4 h-4" />
                                Edit Profile
                            </Link>
                            <button
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
