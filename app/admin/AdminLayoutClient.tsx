"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100 font-sans flex text-slate-900">
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            <main
                className={`
                    flex-1 flex flex-col min-h-screen transition-all duration-300
                    ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}
                `}
            >
                <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
