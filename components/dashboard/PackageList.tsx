"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ExamPackage } from "@/types";
import { ChevronRight, BookOpen, Clock, PlayCircle, Layers, Sparkles, Plus } from "lucide-react";

// Helper component to safely render dates on client only to avoid hydration mismatch
const ClientDate = ({ date }: { date: string }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return <>{new Date(date).toLocaleDateString('id-ID', { dateStyle: 'long' })}</>;
};

interface PackageListProps {
    packages: ExamPackage[];
}

export default function PackageList({ packages }: PackageListProps) {
    if (packages.length === 0) {
        return (
            <div className="text-center py-20 px-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white border-2 border-dashed border-blue-200">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 mb-6 border border-blue-200">
                    <BookOpen className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Belum ada paket ujian</h3>
                <p className="text-slate-600 max-w-md mx-auto text-lg mb-6">
                    Kategori ini belum memiliki paket ujian aktif. Coba pilih filter tingkat pendidikan lainnya.
                </p>
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto opacity-50"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {packages.map((pkg) => {
                const subjectCount = pkg.subjects?.length || 0;

                return (
                    <div
                        key={pkg.id}
                        className="group flex flex-col bg-white rounded-3xl border-2 border-blue-100 shadow-lg hover:shadow-2xl hover:shadow-blue-100/50 hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        {/* Card Header / Banner */}
                        <div className="h-36 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 p-6 flex flex-col justify-between relative overflow-hidden">
                            {/* Abstract Shapes */}
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>

                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex gap-2">
                                    <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm border border-white/30 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" />
                                        Paket Ujian
                                    </span>
                                    {pkg.levels?.name && (
                                        <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/40 text-white backdrop-blur-sm border border-white/20 flex items-center gap-2">
                                            {pkg.levels.name}
                                        </span>
                                    )}
                                </div>
                                {pkg.start_at && (
                                    <span className="text-white/90 text-sm font-medium flex items-center gap-2 px-3 py-1.5 bg-black/10 backdrop-blur-sm rounded-lg">
                                        <Clock className="w-4 h-4" />
                                        <ClientDate date={pkg.start_at} />
                                    </span>
                                )}
                            </div>

                            <div className="relative z-10 mt-4">
                                <h3 className="text-2xl font-bold text-white leading-tight line-clamp-2" title={pkg.title}>
                                    {pkg.title}
                                </h3>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-7 flex-1 flex flex-col gap-6">

                            {/* Stats */}
                            <div className="flex items-center gap-6 text-sm text-slate-600 pb-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                                        <Layers className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-lg">{subjectCount}</div>
                                        <div className="text-slate-500 text-sm">Mata Pelajaran</div>
                                    </div>
                                </div>
                                <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-900 text-lg">120</div>
                                    <div className="text-slate-500 text-sm">Estimasi Menit</div>
                                </div>
                            </div>

                            {/* Subjects List */}
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Daftar Mapel</h4>
                                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                        {subjectCount} Total
                                    </span>
                                </div>

                                {(!pkg.subjects || pkg.subjects.length === 0) ? (
                                    <div className="text-center py-8 text-slate-400 text-sm bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-dashed border-slate-200">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <p>Belum ada mata pelajaran</p>
                                    </div>
                                ) : (
                                    <>
                                        {pkg.subjects.slice(0, 3).map((sub) => (
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
                                        ))}

                                        {subjectCount > 3 && (
                                            <div className="pt-3">
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-slate-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center">
                                                        <span className="px-4 text-sm font-medium text-blue-600 bg-white">
                                                            + {subjectCount - 3} mata pelajaran lainnya
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Action Button */}
                            <Link
                                href={`/exam/${pkg.id}`}
                                className="mt-auto"
                            >

                            </Link>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}