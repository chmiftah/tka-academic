export const dynamic = 'force-dynamic';

import Link from "next/link";

export default async function DashboardPage() {
    return (
        <div className="min-h-screen p-6 lg:p-10 space-y-12">

            {/* Hero Section */}
            <header className="relative overflow-hidden rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-200">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 p-8 lg:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-indigo-50 text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 mb-4">
                            Platform Ujian Online
                        </span>
                        <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
                            Selamat Datang, <span className="text-indigo-200">Budi!</span>
                        </h1>
                        <p className="text-indigo-100 text-lg leading-relaxed max-w-lg mb-8">
                            Siap untuk mengukur kemampuanmu hari ini? Cek jadwal ujian terbaru menu Ujian.
                        </p>

                        <div className="flex gap-4">
                            <Link
                                href="/exam"
                                className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all"
                            >
                                Mulai Ujian
                            </Link>
                            <Link
                                href="/history"
                                className="px-6 py-3 bg-indigo-500/30 text-white font-medium rounded-xl hover:bg-indigo-500/50 backdrop-blur-sm border border-indigo-400/30 transition-all"
                            >
                                Lihat Riwayat
                            </Link>
                        </div>
                    </div>

                    {/* Illustration or Stats could go here later */}
                </div>
            </header>

            {/* Dashboard Stats / Widgets (Placeholder for Future) */}
            <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 font-medium text-sm mb-2">Ujian Diselesaikan</h3>
                    <p className="text-3xl font-bold text-slate-800">0</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 font-medium text-sm mb-2">Rata-rata Nilai</h3>
                    <p className="text-3xl font-bold text-slate-800">-</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 font-medium text-sm mb-2">Peringkat</h3>
                    <p className="text-3xl font-bold text-slate-800">-</p>
                </div>
            </main>
        </div>
    );
}