export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { ExamPackage, Level } from '@/types';
import LevelFilter from "@/components/dashboard/LevelFilter";
import PackageList from "@/components/dashboard/PackageList";
import { Search } from "lucide-react";

// Helper: Fetch Levels
async function getLevels(): Promise<Level[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('levels')
        .select('id, name')
        .order('name');

    if (error) {
        console.error("Fetch Levels Error:", error);
        return [];
    }
    return data || [];
}

// Helper: Fetch Packages (Optional Filter)
async function getPackages(levelId?: string): Promise<ExamPackage[]> {
    const supabase = await createClient();

    let query = supabase
        .from('exam_packages')
        .select(`
      id, 
      title, 
      start_at, 
      end_at,
      level_id,
      levels (
        id,
        name
      ),
      package_subjects (
        subject:subjects (
          id, 
          name
        )
      )
    `)
        .order('created_at', { ascending: false });

    if (levelId) {
        query = query.eq('level_id', levelId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Fetch Packages Error:", error);
        return [];
    }

    // Transform data
    return (data || []).map((pkg: any) => {
        const subjectsRaw = pkg.package_subjects
            ? pkg.package_subjects.map((ps: any) => ps.subject)
            : [];

        // Deduplicate subjects by ID
        const uniqueSubjects = Array.from(new Map(subjectsRaw.map((s: any) => [s.id, s])).values());

        return {
            ...pkg,
            subjects: uniqueSubjects
        };
    });
}

export default async function ExamListPage({ searchParams }: { searchParams: Promise<{ level_id?: string }> }) {
    const params = await searchParams;
    const levelId = params.level_id;

    const [levels, packages] = await Promise.all([
        getLevels(),
        getPackages(levelId)
    ]);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest border border-indigo-100 mb-2">
                        Katalog Ujian
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Available Exams
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 max-w-2xl">
                        Select an exam package to start testing your knowledge.
                    </p>
                </div>
                <div className="flex gap-4 text-xs font-medium text-slate-500">
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-slate-900">{packages.length}</span>
                        <span>Paket</span>
                    </div>
                    <div className="flex flex-col items-end border-l border-slate-200 pl-4">
                        <span className="text-2xl font-bold text-slate-900">{levels.length}</span>
                        <span>Level</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-1 rounded-xl">
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Cari paket ujian..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <LevelFilter levels={levels} />
                </div>
            </div>

            {/* Catalog Grid */}
            <main>
                <PackageList packages={packages} />
            </main>
        </div>
    );
}
