"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ExamPackage } from "@/types";
import { Clock, BookOpen, Layers, ChevronRight, PlayCircle } from "lucide-react";

// Helper component to safely render dates
const ClientDate = ({ date }: { date: string }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return <>{new Date(date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</>;
};

interface PackageListProps {
    packages: ExamPackage[];
}

export default function PackageList({ packages }: PackageListProps) {
    if (packages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-[24px] border border-dashed border-slate-200 text-center">
                <div className="p-4 bg-blue-50 rounded-full mb-4">
                    <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-base font-medium text-slate-800">No exams found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">It seems there are no exams matching your criteria right now.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => {
                const subjectCount = pkg.subjects?.length || 0;

                return (
                    <div
                        key={pkg.id}
                        className="group flex flex-col bg-white rounded-[24px] shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                        {/* Hover Overlay Effect */}
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/[0.02] transition-colors pointer-events-none"></div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                                    {pkg.levels?.name || "General"}
                                </span>
                                {pkg.start_at && (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                        <Clock className="w-3.5 h-3.5" />
                                        <ClientDate date={pkg.start_at} />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-medium text-slate-800 group-hover:text-blue-700 transition-colors leading-snug mb-3">
                                {pkg.title}
                            </h3>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <div className="p-1.5 rounded-full bg-slate-100 text-slate-500">
                                        <Layers className="w-3.5 h-3.5" />
                                    </div>
                                    <span><strong className="text-slate-700">{subjectCount}</strong> Subjects</span>
                                </div>
                                <div className="text-sm text-slate-500">
                                    <span className="text-slate-300 mx-2">|</span>
                                    <span>120 Mins</span>
                                </div>
                            </div>

                            {/* Divider with subtle curve or straight */}
                            <div className="h-px bg-slate-100 mb-4 w-full"></div>

                            <div className="space-y-2 mb-4 flex-1">
                                {pkg.subjects && pkg.subjects.length > 0 ? (
                                    pkg.subjects.slice(0, 3).map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={`/exam/${pkg.id}/${sub.id}`}
                                            className="block transform transition-transform hover:scale-[1.02]"
                                        >
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-blue-50/50 border border-slate-100 group/sub hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <PlayCircle className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-800 group-hover/sub:text-blue-700 truncate">
                                                        {sub.name}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/sub:text-blue-600 transition-colors" />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-400 italic">No subjects listed</span>
                                )}
                                {subjectCount > 3 && (
                                    <div className="text-xs text-blue-500 font-medium pl-4 pt-1">
                                        + {subjectCount - 3} more
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>
                );
            })}
        </div>
    );
}