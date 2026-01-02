export const dynamic = 'force-dynamic';

import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        redirect("/login");
    }

    const email = user.email || "Student";
    const name = email.split('@')[0];
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    // 2. Get Stats
    const { data: results } = await supabase
        .from('exam_results')
        .select('total_score')
        .eq('user_id', user.id);

    const examsCompleted = results?.length || 0;
    const totalScoreSum = results?.reduce((acc, curr) => acc + (curr.total_score || 0), 0) || 0;
    const averageScore = examsCompleted > 0 ? (totalScoreSum / examsCompleted).toFixed(1) : "-";

    // 3. Get Recent/Available Packages (Optional - fetching 3 latest)
    const { data: packages } = await supabase
        .from('exam_packages')
        .select('id, title, level_id, levels(name)')
        .limit(3);

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
                            Selamat Datang, <span className="text-indigo-200 capitalize">{name}!</span>
                        </h1>
                        <p className="text-indigo-100 text-lg leading-relaxed max-w-lg mb-8">
                            Siap untuk mengukur kemampuanmu hari ini? Cek jadwal ujian terbaru menu Ujian.
                        </p>

                        <div className="flex gap-4">
                            <Link
                                href="/package"
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
                </div>
            </header>

            {/* Dashboard Stats */}
            <main className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-slate-500 font-medium text-sm mb-2">Ujian Diselesaikan</h3>
                            <p className="text-4xl font-bold text-slate-800">{examsCompleted}</p>
                        </div>
                        <div className="mt-4 text-xs text-slate-400">Total ujian yang telah Anda kerjakan.</div>
                    </div>
                    {/* <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-slate-500 font-medium text-sm mb-2">Rata-rata Nilai</h3>
                            <p className="text-4xl font-bold text-slate-800">{averageScore}</p>
                        </div>
                        <div className="mt-4 text-xs text-slate-400">Akumulasi rata-rata dari semua ujian.</div>
                    </div> */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-slate-500 font-medium text-sm mb-2">Status Akun</h3>
                            <p className="text-xl font-bold text-green-600">Aktif</p>
                        </div>
                        <div className="mt-4 text-xs text-slate-400">Akun Anda dalam keadaan baik.</div>
                    </div>
                </div>

                {/* Available Packages Section (New) */}
                {/* <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Paket Soal Terbaru</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {packages && packages.length > 0 ? packages.map((pkg: any) => (
                            <Link href={`/exam/${pkg.id}`} key={pkg.id} className="block group">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                                            {pkg.levels?.name || "Umum"}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">
                                        {pkg.title}
                                    </h3>
                                    <p className="text-sm text-slate-500">Klik untuk melihat detail paket.</p>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-3 text-center py-10 text-slate-500 border border-dashed border-slate-300 rounded-xl">
                                Belum ada paket soal tersedia.
                            </div>
                        )}
                    </div>
                </div> */}
            </main>
        </div>
    );
}