import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, LogOut, User, X, ChevronRight, GraduationCap, Clock, ChevronLeft, ChevronDown } from "lucide-react";
import { Level } from "@/types";

interface SidebarProps {
    children?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
    levels?: Level[];
    showDefaultLinks?: boolean; // New prop to show links alongside children
}

export default function StudentSidebar({ children, isOpen, onClose, isCollapsed = false, toggleCollapse, levels = [], showDefaultLinks = false }: SidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // State to toggle the Exam submenu
    const [isExamExpanded, setIsExamExpanded] = useState(false);

    // Auto-expand if on an exam page
    useEffect(() => {
        if (pathname.includes('/exam')) {
            setIsExamExpanded(true);
        }
    }, [pathname]);

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        {
            href: "/exam",
            label: "Ujian",
            icon: GraduationCap,
            hasSubmenu: true
        },
        { href: "/history", label: "Riwayat", icon: Clock },
        { href: "/profile", label: "Profil", icon: User },
    ];

    const isActive = (path: string) => {
        if (path === '/exam' && pathname.includes('/exam')) return true;
        return pathname === path;
    }

    const renderLinks = () => (
        <>
            {links.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;

                // Special rendering for 'Ujian' with submenu
                if (link.hasSubmenu) {
                    return (
                        <div key={link.href}>
                            <button
                                onClick={() => !isCollapsed && setIsExamExpanded(!isExamExpanded)}
                                title={isCollapsed ? link.label : undefined}
                                className={`
                                                        w-full text-left group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                                        ${active
                                        ? "bg-indigo-600/5 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-600/10"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }
                                                        ${isCollapsed ? 'justify-center' : ''}
                                                    `}
                            >
                                <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                                {!isCollapsed && <span className="whitespace-nowrap flex-1">{link.label}</span>}
                                {!isCollapsed && (
                                    <ChevronDown
                                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExamExpanded ? 'rotate-180' : ''}`}
                                    />
                                )}
                            </button>

                            {/* Submenu */}
                            {!isCollapsed && isExamExpanded && (
                                <div className="ml-10 mt-1 space-y-1 border-l-2 border-slate-100 pl-2">
                                    <Link
                                        href="/exam"
                                        onClick={onClose}
                                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/exam' && !searchParams.get('level_id') ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                    >
                                        Semua Tingkat
                                    </Link>
                                    {levels.map(level => {
                                        const levelUrl = `/exam?level_id=${level.id}`;
                                        const currentLevelId = searchParams.get('level_id');
                                        const isActiveLevel = currentLevelId === String(level.id);

                                        return (
                                            <Link
                                                key={level.id}
                                                href={levelUrl}
                                                onClick={onClose}
                                                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActiveLevel ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                            >
                                                {level.name}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        title={isCollapsed ? link.label : undefined}
                        className={`
                        group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                        ${active
                                ? "bg-indigo-600/5 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-600/10"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                    >
                        <Icon className={`w-5 h-5 shrink-0 transition-colors ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`} />
                        {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}
                        {!isCollapsed && active && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
                    </Link>
                );
            })}
        </>
    );

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <aside
                className={`
          fixed top-0 bottom-0 left-0 z-50 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl lg:shadow-none transition-all duration-300 ease-spring
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-72"}
          lg:static lg:border-r lg:border-slate-200/50
        `}
            >
                <div className="flex flex-col h-full">

                    {/* Header */}
                    <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-100 transition-all duration-300`}>
                        <Link href="/dashboard" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform shrink-0">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            {!isCollapsed && (
                                <div className="transition-opacity duration-300">
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent whitespace-nowrap">
                                        TKA System
                                    </h1>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold whitespace-nowrap">Student Area</p>
                                </div>
                            )}
                        </Link>
                        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-slate-600 active:scale-95 transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                        {children ? (
                            <>
                                {/* Custom Children (e.g. Exam Grid) */}
                                {!isCollapsed && (
                                    <div className="mb-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        Menu Ujian
                                    </div>
                                )}
                                {children}

                                {/* Optional: Show Default Links below children if requested */}
                                {showDefaultLinks && (
                                    <>
                                        <div className="my-4 border-t border-slate-100 mx-2"></div>
                                        {!isCollapsed && (
                                            <div className="mb-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                                Menu Utama
                                            </div>
                                        )}
                                        {/* Render Links Logic (Duplicates below logic, so let's refactor or just render) */}
                                        {renderLinks()}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                {!isCollapsed && (
                                    <div className="mb-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        Menu Utama
                                    </div>
                                )}
                                {renderLinks()}
                            </>
                        )}
                    </div>

                    {/* Footer & Toggle */}
                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                        <div className="">
                            <button
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-700 hover:shadow-sm transition-all group ${isCollapsed ? 'justify-center' : ''}`}
                                title={isCollapsed ? "Keluar" : undefined}
                            >
                                <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-600 transition-colors" />
                                {!isCollapsed && <span className="font-medium whitespace-nowrap">Keluar</span>}
                            </button>
                        </div>

                        {/* Collapse Toggler (Desktop Only) */}
                        {toggleCollapse && (
                            <button
                                onClick={toggleCollapse}
                                className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-white hover:shadow-sm hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200"
                            >
                                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
