export default function HeroSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" />

            <div className="relative z-10 p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8">
                        <div className="flex-1 space-y-6">
                            {/* Badge skeleton */}
                            <div className="h-8 w-48 bg-slate-300/50 rounded-full" />

                            {/* Title skeleton */}
                            <div className="space-y-4">
                                <div className="h-12 bg-slate-300/50 rounded-lg w-3/4" />
                                <div className="h-12 bg-slate-300/50 rounded-lg w-2/3" />
                            </div>

                            {/* Description skeleton */}
                            <div className="space-y-2 max-w-2xl">
                                <div className="h-4 bg-slate-300/50 rounded w-full" />
                                <div className="h-4 bg-slate-300/50 rounded w-5/6" />
                                <div className="h-4 bg-slate-300/50 rounded w-4/6" />
                            </div>
                        </div>

                        {/* Stats skeleton */}
                        <div className="grid grid-cols-2 gap-4 min-w-[300px]">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="bg-white/50 backdrop-blur-md rounded-2xl p-6">
                                    <div className="h-8 w-16 bg-slate-300/50 rounded mb-2" />
                                    <div className="h-4 w-24 bg-slate-200/50 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filter skeleton */}
                    <div className="bg-white/50 backdrop-blur-md rounded-2xl p-8">
                        <div className="h-6 w-40 bg-slate-300/50 rounded mb-4" />
                        <div className="h-12 w-full bg-slate-300/50 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}