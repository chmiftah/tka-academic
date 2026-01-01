"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, X, Loader2, Calendar, BookOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Level {
    id: number;
    name: string;
}

interface ExamPackage {
    id: number;
    title: string;
    level_id: number;
    start_at: string;
    end_at: string;
    levels?: Level; // Joined data
}

interface Subject {
    id: number;
    name: string;
    level_id: number;
}

interface PackageSubject {
    id: number;
    exam_package_id: number;
    subject_id: number;
    subjects?: Subject;
}

export default function ExamPackagePage() {
    const [packages, setPackages] = useState<ExamPackage[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // CRUD Package Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<ExamPackage | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        level_id: "",
        start_at: "",
        end_at: ""
    });

    // Subject Management Modal
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [currentPackageSubjects, setCurrentPackageSubjects] = useState<PackageSubject[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    const supabase = createClient();

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setIsLoading(true);
        try {
            // Fetch Packages with Level info
            const { data: pkgData, error: pkgError } = await supabase
                .from("exam_packages")
                .select("*, levels(name)")
                .order("created_at", { ascending: false });

            if (pkgError) throw pkgError;
            setPackages(pkgData || []);

            // Fetch Levels for Dropdown
            const { data: lvlData, error: lvlError } = await supabase
                .from("levels")
                .select("id, name")
                .order("name");

            if (lvlError) throw lvlError;
            setLevels(lvlData || []);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Gagal mengambil data paket soal.");
        } finally {
            setIsLoading(false);
        }
    }

    // Filter
    const filteredPackages = packages.filter((pkg) =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Package CRUD Handlers ---

    const handleOpenModal = (pkg?: ExamPackage) => {
        if (pkg) {
            setCurrentPackage(pkg);
            setFormData({
                title: pkg.title,
                level_id: String(pkg.level_id),
                start_at: pkg.start_at ? new Date(pkg.start_at).toISOString().slice(0, 16) : "",
                end_at: pkg.end_at ? new Date(pkg.end_at).toISOString().slice(0, 16) : ""
            });
        } else {
            setCurrentPackage(null);
            setFormData({
                title: "",
                level_id: "",
                start_at: "",
                end_at: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ title: "", level_id: "", start_at: "", end_at: "" });
        setCurrentPackage(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.level_id || !formData.start_at || !formData.end_at) {
            alert("Mohon lengkapi semua field.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                title: formData.title,
                level_id: parseInt(formData.level_id),
                start_at: new Date(formData.start_at).toISOString(),
                end_at: new Date(formData.end_at).toISOString(),
            };

            if (currentPackage) {
                // Update
                const { error } = await supabase
                    .from("exam_packages")
                    .update(payload)
                    .eq("id", currentPackage.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from("exam_packages")
                    .insert([payload]);

                if (error) throw error;
            }

            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving package:", error);
            alert("Gagal menyimpan paket soal.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus paket soal ini?")) return;

        try {
            const { error } = await supabase
                .from("exam_packages")
                .delete()
                .eq("id", id);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error("Error deleting package:", error);
            alert("Gagal menghapus paket soal.");
        }
    };

    // --- Subject Management Handlers ---

    const handleOpenSubjectModal = async (pkg: ExamPackage) => {
        setCurrentPackage(pkg);
        setIsSubjectModalOpen(true);
        setIsLoadingSubjects(true);

        try {
            // 1. Fetch assigned subjects
            const { data: assignedData, error: assignedError } = await supabase
                .from("package_subjects")
                .select("*, subjects(*)")
                .eq("exam_package_id", pkg.id);

            if (assignedError) throw assignedError;
            setCurrentPackageSubjects(assignedData || []);

            // 2. Fetch all subjects for this level
            const { data: allSubjects, error: subjectsError } = await supabase
                .from("subjects")
                .select("*")
                .eq("level_id", pkg.level_id);

            if (subjectsError) throw subjectsError;

            // 3. Filter out already assigned subjects
            const assignedIds = new Set<number>(assignedData?.map((ps: any) => ps.subject_id as number) || []);
            const available = (allSubjects || []).filter((s: any) => !assignedIds.has(s.id));

            setAvailableSubjects(available);
            setSelectedSubjectId("");

        } catch (error) {
            console.error("Error fetching subjects:", error);
            alert("Gagal memuat data mata pelajaran.");
        } finally {
            setIsLoadingSubjects(false);
        }
    };

    const handleAddSubject = async () => {
        if (!currentPackage || !selectedSubjectId) return;

        setIsLoadingSubjects(true);
        try {
            const { error } = await supabase
                .from("package_subjects")
                .insert([{
                    exam_package_id: currentPackage.id,
                    subject_id: parseInt(selectedSubjectId)
                }]);

            if (error) throw error;

            // Refresh data
            handleOpenSubjectModal(currentPackage);

        } catch (error) {
            console.error("Error adding subject:", error);
            alert("Gagal menambahkan mata pelajaran.");
            setIsLoadingSubjects(false);
        }
    };

    const handleRemoveSubject = async (packageSubjectId: number) => {
        if (!currentPackage) return;

        setIsLoadingSubjects(true);
        try {
            const { error } = await supabase
                .from("package_subjects")
                .delete()
                .eq("id", packageSubjectId);

            if (error) throw error;

            // Refresh data
            handleOpenSubjectModal(currentPackage);

        } catch (error) {
            console.error("Error removing subject:", error);
            alert("Gagal menghapus mata pelajaran.");
            setIsLoadingSubjects(false);
        }
    };

    const handleCloseSubjectModal = () => {
        setIsSubjectModalOpen(false);
        setCurrentPackage(null);
        setCurrentPackageSubjects([]);
        setAvailableSubjects([]);
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Manajemen Paket Soal</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Paket
                </button>
            </div>

            {/* Search & Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari paket soal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-3 w-16">No</th>
                                <th className="px-6 py-3">Nama Paket</th>
                                <th className="px-6 py-3">Jenjang</th>
                                <th className="px-6 py-3">Waktu Mulai</th>
                                <th className="px-6 py-3">Waktu Selesai</th>
                                <th className="px-6 py-3 w-40 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : filteredPackages.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data paket soal.
                                    </td>
                                </tr>
                            ) : (
                                filteredPackages.map((pkg, index) => (
                                    <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-3 font-medium text-slate-800">{pkg.title}</td>
                                        <td className="px-6 py-3 text-slate-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {pkg.levels?.name || "Unknown"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{formatDate(pkg.start_at)}</td>
                                        <td className="px-6 py-3 text-slate-600 whitespace-nowrap">{formatDate(pkg.end_at)}</td>
                                        <td className="px-6 py-3 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenSubjectModal(pkg)}
                                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                                title="Kelola Mata Pelajaran"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(pkg)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pkg.id)}
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

            {/* Create/Edit Package Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">
                                {currentPackage ? "Edit Paket Soal" : "Tambah Paket Soal"}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="p-6 space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nama Paket <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Contoh: Tryout Nasional 2024"
                                    />
                                </div>

                                {/* Level Select */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Jenjang <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.level_id}
                                        onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                                        disabled={!!currentPackage} // Optional: Disable changing level if risky
                                    >
                                        <option value="">Pilih Jenjang</option>
                                        {levels.map(lvl => (
                                            <option key={lvl.id} value={lvl.id}>
                                                {lvl.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Waktu Mulai <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="datetime-local"
                                                required
                                                value={formData.start_at}
                                                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Waktu Selesai <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="datetime-local"
                                                required
                                                value={formData.end_at}
                                                onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
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

            {/* Manage Subjects Modal */}
            {isSubjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Kelola Mata Pelajaran</h3>
                                <p className="text-sm text-slate-500">Paket: <span className="font-semibold text-slate-700">{currentPackage?.title}</span></p>
                            </div>
                            <button onClick={handleCloseSubjectModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            {/* Add Subject Form */}
                            <div className="flex gap-2 mb-6">
                                <select
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm"
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    disabled={isLoadingSubjects}
                                >
                                    <option value="">-- Pilih Mata Pelajaran --</option>
                                    {availableSubjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAddSubject}
                                    disabled={!selectedSubjectId || isLoadingSubjects}
                                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2 whitespace-nowrap"
                                >
                                    {isLoadingSubjects ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Tambah
                                </button>
                            </div>

                            {/* Subjects List */}
                            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3">Mata Pelajaran</th>
                                            <th className="px-4 py-3 w-20 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {isLoadingSubjects && currentPackageSubjects.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                                                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                                    Memuat...
                                                </td>
                                            </tr>
                                        ) : currentPackageSubjects.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                                                    Belum ada mata pelajaran dalam paket ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentPackageSubjects.map((ps) => (
                                                <tr key={ps.id} className="bg-white hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-slate-800">
                                                        {ps.subjects?.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleRemoveSubject(ps.id)}
                                                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                                                            title="Hapus dari paket"
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

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={handleCloseSubjectModal}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
