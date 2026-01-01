"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Level } from "@/types";
import { ChevronDown, Filter } from "lucide-react";

interface LevelFilterProps {
    levels: Level[];
}

export default function LevelFilter({ levels }: LevelFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default: Ambil dari URL atau kosong
    const [selectedLevel, setSelectedLevel] = useState(searchParams.get("level_id") || "");

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedLevel(val);
        const params = new URLSearchParams(searchParams);
        if (val) {
            params.set("level_id", val);
        } else {
            params.delete("level_id");
        }
        router.push(`/exam?${params.toString()}`);
    };

    return (
        <div className="relative group min-w-[200px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none z-10">
                <Filter className="w-4 h-4" />
            </div>
            <select
                value={selectedLevel}
                onChange={handleChange}
                className="
                    appearance-none w-full bg-slate-50 border border-slate-200 text-slate-700 
                    pl-10 pr-10 py-2.5 rounded-xl font-medium text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                    hover:bg-white hover:border-slate-300 transition-all cursor-pointer shadow-sm
                "
            >
                <option value="">Semua Tingkat</option>
                {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                        {lvl.name}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
    );
}
