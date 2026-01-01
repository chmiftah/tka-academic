"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Level } from "@/types";

export default function LevelManagementPage() {
    const [levels, setLevels] = useState<Level[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
    const [formData, setFormData] = useState({ name: "" });
    const [isSaving, setIsSaving] = useState(false);

    const supabase = createClient();

    // Fetch Levels
    useEffect(() => {
        fetchLevels();
    }, []);

    async function fetchLevels() {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("levels")
            .select("*")
            .order("name");

        if (error) {
            console.error("Error fetching levels:", error);
            alert("Gagal mengambil data jenjang.");
        } else {
            setLevels(data || []);
        }
        setIsLoading(false);
    }

    // Filtered Levels
    const filteredLevels = levels.filter((level) =>
        level.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Form Handlers
    const handleOpenModal = (level?: Level) => {
        if (level) {
            setCurrentLevel(level);
            setFormData({ name: level.name });
        } else {
            setCurrentLevel(null);
            setFormData({ name: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ name: "" });
        setCurrentLevel(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsSaving(true);
        try {
            if (currentLevel) {
                // Update
                const { error } = await supabase
                    .from("levels")
                    .update({ name: formData.name })
                    .eq("id", currentLevel.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from("levels")
                    .insert([{ name: formData.name }]);

                if (error) throw error;
            }

            fetchLevels();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving level:", error);
            alert("Gagal menyimpan data.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus jenjang ini?")) return;

        try {
            const { error } = await supabase
                .from("levels")
                .delete()
                .eq("id", id);

            if (error) throw error;
            fetchLevels();
        } catch (error) {
            console.error("Error deleting level:", error);
            // Check for foreign key constraint errors
            alert("Gagal menghapus. Pastikan jenjang tidak sedang digunakan oleh data lain.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Manajemen Jenjang</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Jenjang
                </button>
            </div>

            {/* Search & Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari jenjang..."
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
                                <th className="px-6 py-3">Nama Jenjang</th>
                                <th className="px-6 py-3 w-32 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : filteredLevels.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                        Tidak ada data jenjang.
                                    </td>
                                </tr>
                            ) : (
                                filteredLevels.map((level, index) => (
                                    <tr key={level.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-3 font-medium text-slate-800">{level.name}</td>
                                        <td className="px-6 py-3 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(level)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(level.id)}
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
                                {currentLevel ? "Edit Jenjang" : "Tambah Jenjang Baru"}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            <div className="p-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nama Jenjang <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Contoh: SD, SMP, SMA"
                                />
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
