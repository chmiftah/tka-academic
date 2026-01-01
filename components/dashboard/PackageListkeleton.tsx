import PackageSkeleton from "./PackageSkeleton";
import DashboardStatsSkeleton from "./DashboardStatsSkeleton";

interface PackageListSkeletonProps {
    showStats?: boolean;
    packageCount?: number;
}

export default function PackageListSkeleton({
    showStats = true,
    packageCount = 6
}: PackageListSkeletonProps) {
    return (
        <div className="max-w-7xl mx-auto animate-pulse">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-10 bg-slate-300 rounded-full" />
                        <div className="h-8 w-64 bg-slate-300 rounded-lg" />
                    </div>
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-10 w-32 bg-slate-200 rounded-full" />
                    <div className="h-10 w-24 bg-slate-200 rounded-lg" />
                </div>
            </div>

            {/* Stats skeleton */}
            {showStats && <DashboardStatsSkeleton />}

            {/* Package grid skeleton */}
            <PackageSkeleton count={packageCount} />

            {/* Pagination skeleton (if needed) */}
            <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-10 w-10 rounded-lg ${i === 0 ? 'bg-indigo-200' : 'bg-slate-200'}`}
                    />
                ))}
            </div>
        </div>
    );
}