import { createClient } from "@/utils/supabase/client";
import { ExamPackage, Level } from '@/types';
import LevelFilter from "@/components/dashboard/LevelFilter";
import PackageList from "@/components/dashboard/PackageList";

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
        <div className="min-h-screen p-6 lg:p-10 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Katalog Ujian</h1>
                    <p className="text-slate-500 mt-2 text-lg">Pilih dan kerjakan ujian sesuai jenjang Anda.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Filter Jenjang:</span>
                    <div className="w-full md:w-48">
                        <LevelFilter levels={levels} />
                    </div>
                </div>
            </div>

            {/* Catalog List */}
            <main>
                <div className="flex items-center justify-between mb-6">
                    <div className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                        Menampilkan {packages.length} Paket Ujian
                    </div>
                </div>

                <PackageList packages={packages} />
            </main>
        </div>
    );
}
