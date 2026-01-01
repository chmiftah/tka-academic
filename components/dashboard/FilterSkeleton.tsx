interface FilterSkeletonProps {
    count?: number;
    className?: string;
}

export default function FilterSkeleton({
    count = 5,
    className = ""
}: FilterSkeletonProps) {
    const filterItems = Array.from({ length: count });

    return (
        <div className={`flex flex-wrap gap-3 ${className}`}>
            {/* Active filter skeleton (first one) */}
            <div className="relative">
                <div className="h-11 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl animate-pulse" />
            </div>

            {/* Inactive filters */}
            {filterItems.slice(1).map((_, index) => (
                <div
                    key={index}
                    className="relative overflow-hidden"
                >
                    <div
                        className="h-11 bg-slate-100 rounded-xl"
                        style={{ width: `${Math.random() * 60 + 80}px` }}
                    />
                </div>
            ))}
        </div>
    );
}