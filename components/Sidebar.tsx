"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    GraduationCap,
    Clock,
    User,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    LogOut,
    X,
    BookOpen
} from "lucide-react";
import { Level } from "@/types";
import { logout } from "@/app/auth/actions";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    levels?: Level[];
}

export default function Sidebar({ isOpen, onClose, levels = [] }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isExamExpanded, setIsExamExpanded] = useState(false);

    const isActive = (path: string) => pathname === path;
    const isExamActive = pathname.startsWith("/exam");

    // MD3 Navigation Drawer styles
    const navItemBase = "flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 select-none";
    const navItemActive = "bg-blue-100/80 text-blue-900 shadow-sm";
    const navItemInactive = "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-full bg-white transition-all duration-300 ease-in-out
                    lg:sticky lg:top-0 lg:h-screen
                    ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0 lg:shadow-none"}
                    ${isCollapsed ? "w-[88px]" : "w-80"}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={`h-20 flex items-center ${isCollapsed ? "justify-center" : "justify-between px-6 pl-8"}`}>
                        {!isCollapsed && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                                    T
                                </div>
                                <span className="text-xl font-medium tracking-tight text-slate-800">
                                    TKA System
                                </span>
                            </div>
                        )}
                        <div className="flex items-center">
                            {/* Desktop Collapse Toggle */}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="hidden lg:flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
                            >
                                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                            </button>

                            {/* Mobile Close */}
                            <button
                                onClick={onClose}
                                className="lg:hidden p-2 text-slate-400 hover:text-red-500 rounded-full"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2 custom-scrollbar">
                        {/* Dashboard */}
                        <Link
                            href="/dashboard"
                            onClick={onClose}
                            title={isCollapsed ? "Dashboard" : ""}
                            className={`${navItemBase} ${isActive("/dashboard") ? navItemActive : navItemInactive} ${isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : ""}`}
                        >
                            <LayoutDashboard size={22} className={isActive("/dashboard") ? "text-blue-700" : ""} />
                            {!isCollapsed && <span>Dashboard</span>}
                        </Link>

                        {/* Exam Section (Collapsible) */}
                        <div className="pt-2">
                            {!isCollapsed ? (
                                <div className="rounded-3xl overflow-hidden">
                                    {/* ^ Overflow hidden to contain submenu animations if we added them, but keeping simple for now */}
                                    <button
                                        onClick={() => setIsExamExpanded(!isExamExpanded)}
                                        className={`${navItemBase} w-full justify-between ${isExamActive ? isExamExpanded ? "bg-slate-50 text-blue-900" : navItemActive : navItemInactive}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <GraduationCap size={22} className={isExamActive ? "text-blue-700" : ""} />
                                            <span>Ujian</span>
                                        </div>
                                        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isExamExpanded ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* Submenu */}
                                    {isExamExpanded && (
                                        <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                            <Link
                                                href="/exam"
                                                onClick={onClose}
                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm ml-4 transition-colors ${isActive('/exam') && !pathname.includes('=') ? "bg-blue-50 text-blue-800 font-medium" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                                                Semua Paket
                                            </Link>
                                            {levels.map(level => {
                                                const levelUrl = `/exam?level_id=${level.id}`;
                                                // Simple check might need refinement if URL params handling changes
                                                const isLevelActive = pathname === '/exam' && window.location.search.includes(level.id.toString());

                                                return (
                                                    <Link
                                                        key={level.id}
                                                        href={levelUrl}
                                                        onClick={onClose}
                                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm ml-4 transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-50`}
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                                                        {level.name}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/exam"
                                    onClick={onClose}
                                    title="Ujian"
                                    className={`${navItemBase} ${isExamActive ? navItemActive : navItemInactive} justify-center px-0 w-12 h-12 mx-auto`}
                                >
                                    <GraduationCap size={22} className={isExamActive ? "text-blue-700" : ""} />
                                </Link>
                            )}
                        </div>

                        {/* Other Items */}
                        <Link
                            href="/history"
                            onClick={onClose}
                            title={isCollapsed ? "Riwayat" : ""}
                            className={`${navItemBase} ${isActive("/history") ? navItemActive : navItemInactive} ${isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : ""}`}
                        >
                            <Clock size={22} className={isActive("/history") ? "text-blue-700" : ""} />
                            {!isCollapsed && <span>Riwayat</span>}
                        </Link>

                        <Link
                            href="/profile"
                            onClick={onClose}
                            title={isCollapsed ? "Profil" : ""}
                            className={`${navItemBase} ${isActive("/profile") ? navItemActive : navItemInactive} ${isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : ""}`}
                        >
                            <User size={22} className={isActive("/profile") ? "text-blue-700" : ""} />
                            {!isCollapsed && <span>Profil</span>}
                        </Link>

                    </div>

                    {/* Footer */}
                    <div className="p-4 mb-2">
                        <button
                            onClick={() => logout()}
                            title={isCollapsed ? "Logout" : ""}
                            className={`${navItemBase} w-full text-slate-500 hover:bg-red-50 hover:text-red-700 ${isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : ""}`}
                        >
                            <LogOut size={22} />
                            {!isCollapsed && <span>Sign out</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
