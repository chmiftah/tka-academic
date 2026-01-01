"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, X, Loader2, Filter, FileQuestion, FileJson } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Level {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
    level_id: number;
    levels?: Level;
}

interface ExamPackage {
    id: number;
    title: string;
}

export default function SubjectPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [packages, setPackages] = useState<ExamPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLevelId, setFilterLevelId] = useState("");
    const [filterPackageId, setFilterPackageId] = useState("");

    // For Package Filter
    const [packageSubjectIds, setPackageSubjectIds] = useState<Set<number>>(new Set());

    // CRUD Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        level_id: ""
    });
    const [isSaving, setIsSaving] = useState(false);

    const supabase = createClient();

    // Fetch Initial Data
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch Package Subjects when Filter Changes
    useEffect(() => {
        if (filterPackageId) {
            fetchPackageSubjects(filterPackageId);
        } else {
            setPackageSubjectIds(new Set());
        }
    }, [filterPackageId]);

    async function fetchInitialData() {
        setIsLoading(true);
        try {
            // 1. Fetch Subjects with Levels
            const { data: subjectData, error: subjectError } = await supabase
                .from("subjects")
                .select("*, levels(name)")
                .order("name");

            if (subjectError) throw subjectError;
            setSubjects(subjectData || []);

            // 2. Fetch Levels
            const { data: levelData, error: levelError } = await supabase
                .from("levels")
                .select("id, name")
                .order("name");

            if (levelError) throw levelError;
            setLevels(levelData || []);

            // 3. Fetch Packages (for filter)
            const { data: packageData, error: packageError } = await supabase
                .from("exam_packages")
                .select("id, title")
                .order("created_at", { ascending: false });

            if (packageError) throw packageError;
            setPackages(packageData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Gagal mengambil data.");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchPackageSubjects(packageId: string) {
        try {
            const { data, error } = await supabase
                .from("package_subjects")
                .select("subject_id")
                .eq("exam_package_id", packageId);

            if (error) throw error;

            const ids = new Set<number>(data?.map((item: any) => item.subject_id as number) || []);
            setPackageSubjectIds(ids);
        } catch (error) {
            console.error("Error fetching package subjects:", error);
        }
    }

    // --- Filter Logic ---
    const filteredSubjects = subjects.filter((subject) => {
        const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = filterLevelId ? String(subject.level_id) === filterLevelId : true;
        const matchesPackage = filterPackageId ? packageSubjectIds.has(subject.id) : true;

        return matchesSearch && matchesLevel && matchesPackage;
    });

    // --- CRUD Handlers ---

    const handleOpenModal = (subject?: Subject) => {
        if (subject) {
            setCurrentSubject(subject);
            setFormData({
                name: subject.name,
                level_id: String(subject.level_id)
            });
        } else {
            setCurrentSubject(null);
            setFormData({
                name: "",
                level_id: filterLevelId || "" // Auto-fill if level filter is active
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ name: "", level_id: "" });
        setCurrentSubject(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.level_id) {
            alert("Mohon lengkapi nama dan jenjang.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: formData.name,
                level_id: parseInt(formData.level_id)
            };

            if (currentSubject) {
                // Update
                const { error } = await supabase
                    .from("subjects")
                    .update(payload)
                    .eq("id", currentSubject.id);
                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from("subjects")
                    .insert([payload]);
                if (error) throw error;
            }

            // Refresh Subjects Only
            const { data, error } = await supabase
                .from("subjects")
                .select("*, levels(name)")
                .order("name");

            if (!error && data) setSubjects(data);

            handleCloseModal();
        } catch (error) {
            console.error("Error saving subject:", error);
            alert("Gagal menyimpan mata pelajaran.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus mata pelajaran ini?")) return;

        try {
            const { error } = await supabase
                .from("subjects")
                .delete()
                .eq("id", id);

            if (error) throw error;

            // Refresh
            setSubjects(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error("Error deleting subject:", error);
            alert("Gagal menghapus. Pastikan tidak ada data terkait.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Manajemen Mata Pelajaran</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Mapel
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari mata pelajaran..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="relative min-w-[150px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                            value={filterLevelId}
                            onChange={(e) => setFilterLevelId(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white appearance-none"
                        >
                            <option value="">Semua Jenjang</option>
                            {levels.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <select
                            value={filterPackageId}
                            onChange={(e) => setFilterPackageId(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white appearance-none"
                        >
                            <option value="">Semua Paket Soal</option>
                            {packages.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-3 w-16">No</th>
                                <th className="px-6 py-3">Nama Mata Pelajaran</th>
                                <th className="px-6 py-3">Jenjang</th>
                                <th className="px-6 py-3 w-32 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : filteredSubjects.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data mata pelajaran yang sesuai.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubjects.map((subject, index) => (
                                    <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-3 font-medium text-slate-800">{subject.name}</td>
                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {subject.levels?.name || "Unknown"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 flex items-center justify-center gap-2">
                                            <a
                                                href={`/admin/mapel/${subject.id}/questions`}
                                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                                title="Kelola Soal"
                                            >
                                                <FileQuestion className="w-4 h-4" />
                                            </a>
                                            <a
                                                href={`/admin/mapel/${subject.id}/import`}
                                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                                title="Import JSON"
                                            >
                                                <FileJson className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleOpenModal(subject)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">
                                {currentSubject ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nama Mata Pelajaran <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Contoh: Matematika, IPA"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Jenjang <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.level_id}
                                        onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="">Pilih Jenjang</option>
                                        {levels.map(lvl => (
                                            <option key={lvl.id} value={lvl.id}>
                                                {lvl.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                                    disabled={isSaving}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                    disabled={isSaving}
                                >
                                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
