"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExamPackage } from "@/types";
import { ChevronRight, BookOpen, Clock, PlayCircle, Layers } from "lucide-react";

interface PackageListProps {
    packages: ExamPackage[];
}

export default function PackageList({ packages }: PackageListProps) {
    if (packages.length === 0) {
        return (
            <div className="text-center py-20 px-6 rounded-3xl bg-white border border-dashed border-slate-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6 text-indigo-500">
                    <BookOpen className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada paket ujian</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    Kategori ini belum memiliki paket ujian aktif. Coba pilih filter tingkat pendidikan lainnya.
                </p>
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
                        className="group flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-200 transition-all duration-300 overflow-hidden"
                    >
                        {/* Card Header / Banner */}
                        <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-600 p-6 flex flex-col justify-between relative overflow-hidden">
                            {/* Abstract Shapes */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm border border-white/10">
                                    Paket Ujian
                                </span>
                                {pkg.start_at && (
                                    <span className="text-white/80 text-xs font-medium flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(pkg.start_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white leading-tight line-clamp-2" title={pkg.title}>
                                    {pkg.title}
                                </h3>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex-1 flex flex-col gap-6">

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-slate-500 pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-indigo-500" />
                                    <span className="font-semibold text-slate-700">{subjectCount}</span> Mapel
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                <div>Estimasi 120 Menit</div>
                            </div>

                            {/* Subjects List */}
                            <div className="space-y-3 flex-1">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Daftar Mata Pelajaran</h4>
                                {(!pkg.subjects || pkg.subjects.length === 0) ? (
                                    <div className="text-center py-4 text-slate-400 italic text-sm bg-slate-50 rounded-xl">
                                        Belum ada mata pelajaran
                                    </div>
                                ) : (
                                    pkg.subjects.slice(0, 3).map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={`/exam/${pkg.id}/${sub.id}`} // Check URL patten
                                            className="block"
                                        >
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group/sub hover:bg-indigo-50 hover:border-indigo-100 transition-colors">
                                                <span className="text-sm font-semibold text-slate-700 group-hover/sub:text-indigo-700 truncate mr-2">
                                                    {sub.name}
                                                </span>
                                                <PlayCircle className="w-4 h-4 text-slate-400 group-hover/sub:text-indigo-600 transition-colors" />
                                            </div>
                                        </Link>
                                    ))
                                )}
                                {subjectCount > 3 && (
                                    <div className="text-center pt-2">
                                        <span className="text-xs font-medium text-slate-500">
                                            + {subjectCount - 3} mata pelajaran lainnya
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className="mt-auto pt-2">
                                <button className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 active:scale-95 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2">
                                    Lihat Detail Paket
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
