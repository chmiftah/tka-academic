interface DashboardStatsProps {
    packages: any[];
}

export default function DashboardStats({ packages }: DashboardStatsProps) {
    const stats = {
        total: packages.length,
        active: packages.filter(p => new Date(p.end_at) > new Date()).length,
        featured: packages.filter(p => p.is_featured).length,
        averageQuestions: Math.round(
            packages.reduce((acc, p) => acc + (p.question_count || 0), 0) / (packages.length || 1)
        )
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                <div className="text-sm text-slate-600">Total Paket</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-slate-600">Aktif</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="text-2xl font-bold text-purple-600">{stats.featured}</div>
                <div className="text-sm text-slate-600">Rekomendasi</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="text-2xl font-bold text-blue-600">{stats.averageQuestions}</div>
                <div className="text-sm text-slate-600">Rata-rata Soal</div>
            </div>
        </div>
    );
}