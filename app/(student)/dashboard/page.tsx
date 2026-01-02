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
        <div className="space-y-8 max-w-7xl mx-auto pb-12">

            {/* Hero Section - MD3 Large Surface */}
            <div className="relative overflow-hidden rounded-[32px] bg-blue-600 text-white shadow-xl h-auto min-h-[220px] p-8 md:p-10 flex flex-col justify-center">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-50 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md mb-6">
                        Student Area
                    </span>
                    <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                        Welcome back, <span className="opacity-90 font-bold">{capitalizedName}</span>
                    </h1>
                    <p className="text-blue-50 text-base leading-relaxed mb-8 max-w-lg">
                        You have completed <strong className="text-white font-semibold">{examsCompleted}</strong> exams.
                        Ready to continue your learning journey?
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/exam"
                            className="inline-flex items-center px-6 py-3 bg-white text-blue-700 text-sm font-bold rounded-full shadow-sm hover:shadow-md hover:bg-blue-50 transition-all transform active:scale-95"
                        >
                            Find New Exams
                        </Link>
                        <Link
                            href="/history"
                            className="inline-flex items-center px-6 py-3 bg-blue-700/50 text-white text-sm font-medium rounded-full border border-blue-400/30 hover:bg-blue-700 hover:border-blue-400/50 transition-all backdrop-blur-sm active:scale-95"
                        >
                            View History
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Stats Cards (Span 4) */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-lg font-medium text-slate-800 ml-1">Overview</h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Exam Stats Card - MD3 Elevated */}
                        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-transparent hover:shadow-md transition-shadow">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Total Exams</h3>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold text-blue-600 tracking-tight">{examsCompleted}</p>
                                <span className="text-sm text-slate-400 font-medium">Completed</span>
                            </div>
                        </div>

                        {/* Score Stats Card - MD3 Filled */}
                        <div className="bg-blue-50/50 p-6 rounded-[24px] border-none">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Average Score</h3>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold text-slate-800 tracking-tight">{averageScore}</p>
                                <span className="text-sm text-slate-400 font-medium">/ 100</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Packages (Span 8) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-lg font-medium text-slate-800">Available Packages</h2>
                        <Link href="/exam" className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                            View All
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {packages && packages.length > 0 ? packages.map((pkg: any) => (
                            <Link href={`/exam?package_id=${pkg.id}`} key={pkg.id} className="group block h-full">
                                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-transparent hover:shadow-md transition-all h-full flex flex-col relative overflow-hidden">

                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                        {/* Decorative Icon Blob */}
                                        <div className="w-16 h-16 bg-blue-600 rounded-full blur-xl"></div>
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="mb-4">
                                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                {pkg.levels?.name || "General"}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                                            {pkg.title}
                                        </h3>

                                        <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-2">
                                            Tap to view details and start this exam session.
                                        </p>

                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                            <span className="text-xs text-slate-400 font-medium">Auto-Enroll</span>
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-2 py-12 bg-white rounded-[24px] border border-dashed border-slate-200 text-center">
                                <p className="text-slate-500">No exam packages available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}