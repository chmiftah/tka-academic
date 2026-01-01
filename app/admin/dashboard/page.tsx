import React from 'react';
import { Users, BookOpen, Files, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Overview Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Siswa", value: "1,204", icon: Users, color: "bg-blue-500" },
                    { label: "Paket Soal", value: "42", icon: Files, color: "bg-indigo-500" },
                    { label: "Mata Pelajaran", value: "12", icon: BookOpen, color: "bg-emerald-500" },
                    { label: "Ujian Selesai", value: "3,502", icon: CheckCircle, color: "bg-amber-500" },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white shadow-lg shadow-black/10`}>
                                <Icon className="w-6 h-6" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Aktivitas Terbaru</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                    US
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-800">User Siswa {i} <span className="text-slate-500 font-normal">menyelesaikan ujian</span> Matematika Dasar</p>
                                    <p className="text-xs text-slate-400 mt-0.5">2 menit yang lalu</p>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                    Nilai: 85
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Statistik Server</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">CPU Usage</span>
                                <span className="font-bold text-slate-700">24%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[24%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500">Memory</span>
                                <span className="font-bold text-slate-700">58%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[58%]"></div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                System Healthy
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
