interface PackageSkeletonProps {
    count?: number;
    className?: string;
}

export default function PackageSkeleton({
    count = 6,
    className = ""
}: PackageSkeletonProps) {
    const skeletonItems = Array.from({ length: count });

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {skeletonItems.map((_, index) => (
                <div
                    key={index}
                    className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-pulse"
                >
                    {/* Image/Thumbnail Skeleton */}
                    <div className="h-48 bg-gradient-to-r from-slate-100 to-slate-200 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
                    </div>

                    <div className="p-6">
                        {/* Badge Skeleton */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-20 bg-slate-200 rounded-full" />
                            <div className="h-6 w-16 bg-slate-200 rounded-full" />
                        </div>

                        {/* Title Skeleton */}
                        <div className="space-y-2 mb-4">
                            <div className="h-6 bg-slate-200 rounded w-3/4" />
                            <div className="h-4 bg-slate-100 rounded w-1/2" />
                        </div>

                        {/* Description Skeleton */}
                        <div className="space-y-2 mb-6">
                            <div className="h-3 bg-slate-100 rounded w-full" />
                            <div className="h-3 bg-slate-100 rounded w-5/6" />
                            <div className="h-3 bg-slate-100 rounded w-4/6" />
                        </div>

                        {/* Stats Skeleton */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-slate-200 rounded" />
                                    <div className="h-4 w-12 bg-slate-100 rounded" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-slate-200 rounded" />
                                    <div className="h-4 w-10 bg-slate-100 rounded" />
                                </div>
                            </div>
                            <div className="h-6 w-20 bg-slate-200 rounded-full" />
                        </div>

                        {/* Subjects Skeleton */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-8 w-20 bg-slate-100 rounded-lg"
                                />
                            ))}
                        </div>

                        {/* Button Skeleton */}
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-32 bg-slate-200 rounded-lg" />
                            <div className="h-8 w-8 bg-slate-200 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}