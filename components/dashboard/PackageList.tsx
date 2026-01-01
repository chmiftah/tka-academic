"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExamPackage } from "@/types";
import { ChevronDown, ChevronRight, BookOpen, Clock, FileText } from "lucide-react";

interface PackageListProps {
    packages: ExamPackage[];
}

export default function PackageList({ packages }: PackageListProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

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
        <div className="grid gap-6">
            {packages.map((pkg) => {
                const isExpanded = expandedId === pkg.id;

                return (
                    <div
                        key={pkg.id}
                        className={`
                            bg-white rounded-2xl border transition-all duration-300 ease-out overflow-hidden
                            ${isExpanded
                                ? 'border-indigo-200 shadow-xl shadow-indigo-100/50 scale-[1.01]'
                                : 'border-slate-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50'
                            }
                        `}
                    >
                        {/* Header */}
                        <button
                            onClick={() => toggleExpand(pkg.id)}
                            className="w-full text-left p-6 md:p-8 flex items-start md:items-center justify-between group gap-4"
                        >
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center flex-wrap gap-3">
                                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/10">
                                        Paket Ujian
                                    </span>
                                    {pkg.start_at && (
                                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(pkg.start_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                    {pkg.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="font-semibold text-slate-700">{pkg.subjects?.length || 0}</span> Mata Pelajaran
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>Estimasi 120 Menit</span>
                                </div>
                            </div>

                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                                ${isExpanded ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}
                            `}>
                                <ChevronDown className="w-6 h-6" />
                            </div>
                        </button>

                        {/* Content */}
                        <div
                            className={`
                                overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/50
                                ${isExpanded ? 'max-h-[800px] opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0'}
                            `}
                        >
                            <div className="p-6 md:p-8 grid gap-4 md:grid-cols-2">
                                {(!pkg.subjects || pkg.subjects.length === 0) ? (
                                    <div className="col-span-full py-8 text-center text-slate-500 italic">
                                        Subjek belum tersedia.
                                    </div>
                                ) : (
                                    pkg.subjects.map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={`/exam/${pkg.id}/${sub.id}`}
                                            className="
                                                group relative bg-white p-5 rounded-xl border border-slate-200 
                                                hover:border-indigo-300 hover:ring-2 hover:ring-indigo-100 transition-all duration-200
                                                flex items-center gap-5
                                            "
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                                                    {sub.name}
                                                </h4>
                                                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                                                    Klik untuk mulai <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
