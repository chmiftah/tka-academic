export default function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-8 w-16 bg-slate-300 rounded" />
                        <div className="h-3 w-32 bg-slate-100 rounded" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="h-2 w-full bg-slate-100 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}