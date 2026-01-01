"use client";

import React, { useState } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import StudentHeader from "@/components/StudentHeader";
import { Level } from "@/types";

interface ClientLayoutProps {
    children: React.ReactNode;
    levels: Level[];
}

export default function StudentLayoutClient({ children, levels }: ClientLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <StudentSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                levels={levels}
            />

            <main className="flex-1 flex flex-col min-h-screen transition-all duration-300">
                <StudentHeader onMenuClick={() => setIsSidebarOpen(true)} />
                {children}
            </main>
        </div>
    );
}
