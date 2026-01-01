import { createClient } from "@/utils/supabase/client";
import { ExamPackage, Level } from '@/types';
import LevelFilter from "@/components/dashboard/LevelFilter";
import PackageList from "@/components/dashboard/PackageList";
import { Search } from "lucide-react";

// Helper: Fetch Levels
async function getLevels(): Promise<Level[]> {
    const supabase = createClient();
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
    const supabase = createClient();

    let query = supabase
        .from('exam_packages')
        .select(`
      id, 
      title, 
      start_at, 
      end_at,
      level_id,
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
        <div className="min-h-screen p-6 lg:p-10 space-y-10 max-w-[1920px] mx-auto">
            {/* Modern Header Section */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl shadow-indigo-200/50">
                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl text-center md:text-left">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold uppercase tracking-widest border border-white/5 mb-4">
                            Katalog Ujian
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
                            Asah Kemampuanmu <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Raih Prestasi Terbaik</span>
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            Pilih paket ujian yang sesuai dengan jenjang dan kebutuhan belajarmu. Kerjakan sekarang dan evaluasi hasilnya.
                        </p>
                    </div>

                    {/* Stats or Illustration Placeholder */}
                    <div className="hidden md:flex gap-6">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center min-w-[140px]">
                            <div className="text-3xl font-bold text-white mb-1">{packages.length}</div>
                            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Paket Tersedia</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center min-w-[140px]">
                            <div className="text-3xl font-bold text-indigo-400 mb-1">{levels.length}</div>
                            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Jenjang</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="sticky top-4 z-20 bg-white/80 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl shadow-lg shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    {/* Placeholder search input - Logic to be implemented or simply purely visual for now */}
                    <input
                        type="text"
                        placeholder="Cari paket ujian..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="hidden md:block text-sm font-semibold text-slate-500">Filter:</span>
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
