"use client";

import React, { useState } from 'react';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Save,
    X,
    GripVertical
} from 'lucide-react';

// --- Types ---
interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
    score: number;
}

interface Question {
    id: string;
    text: string;
    type: "PG" | "CHECKLIST";
    level: "SD" | "SMP" | "SMA";
    options: Option[];
}

// --- Mock Data ---
const MOCK_QUESTIONS: Question[] = [
    {
        id: "1",
        text: "Siapakah penemu bola lampu?",
        type: "PG",
        level: "SD",
        options: [
            { id: "o1", text: "Thomas Edison", isCorrect: true, score: 1 },
            { id: "o2", text: "Nikola Tesla", isCorrect: false, score: 0 },
        ]
    },
    {
        id: "2",
        text: "Pilihlah bilangan prima di bawah ini!",
        type: "CHECKLIST",
        level: "SMP",
        options: [
            { id: "o1", text: "2", isCorrect: true, score: 1 },
            { id: "o2", text: "4", isCorrect: false, score: -1 },
            { id: "o3", text: "5", isCorrect: true, score: 1 },
        ]
    }
];

export default function QuestionsPage() {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    // Form State
    const [formData, setFormData] = useState<Question>({
        id: '',
        text: '',
        type: 'PG',
        level: 'SD',
        options: []
    });

    const handleCreate = () => {
        setEditingQuestion(null);
        setFormData({
            id: Math.random().toString(36).substr(2, 9),
            text: '',
            type: 'PG',
            level: 'SD',
            options: [
                { id: '1', text: '', isCorrect: false, score: 0 },
                { id: '2', text: '', isCorrect: false, score: 0 }
            ]
        });
        setView('form');
    };

    const handleEdit = (q: Question) => {
        setEditingQuestion(q);
        setFormData({ ...q });
        setView('form');
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure?')) {
            setQuestions(prev => prev.filter(q => q.id !== id));
        }
    };

    const handleSave = () => {
        if (editingQuestion) {
            setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? formData : q));
        } else {
            setQuestions(prev => [...prev, formData]);
        }
        setView('list');
    };

    const updateOption = (idx: number, field: keyof Option, value: string | boolean | number) => {
        const newOptions = [...formData.options];
        newOptions[idx] = { ...newOptions[idx], [field]: value };
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        setFormData({
            ...formData,
            options: [...formData.options, { id: Math.random().toString(36).substr(2, 5), text: '', isCorrect: false, score: 0 }]
        });
    };

    const removeOption = (idx: number) => {
        const newOptions = formData.options.filter((_, i) => i !== idx);
        setFormData({ ...formData, options: newOptions });
    };

    if (view === 'list') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800">Daftar Soal</h1>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Soal
                    </button>
                </div>

                {/* Search & Filters (Mock) */}
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari soal..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600">Snippet Soal</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 w-32">Tipe</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 w-24">Level</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 w-32 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {questions.map((q) => (
                                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-700 font-medium truncate max-w-lg">
                                        {q.text}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${q.type === 'PG' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                            {q.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {q.level}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(q)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // --- Form View ---
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-800">
                    {editingQuestion ? 'Edit Soal' : 'Buat Soal Baru'}
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setView('list')}
                        className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        Simpan
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tipe Soal</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as Question['type'] })}
                            className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="PG">Pilihan Ganda</option>
                            <option value="CHECKLIST">Pilihan Ganda Kompleks (Checklist)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Jenjang</label>
                        <select
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value as Question['level'] })}
                            className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="SD">SD / MI</option>
                            <option value="SMP">SMP / MTs</option>
                            <option value="SMA">SMA / SMK / MA</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pertanyaan / Stimulus</label>
                    <textarea
                        rows={4}
                        value={formData.text}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        placeholder="Tuliskan pertanyaan disini..."
                        className="w-full rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-4 text-base"
                    />
                    <p className="mt-2 text-xs text-slate-500">Mendukung format HTML sederhana.</p>
                </div>

                {/* Options */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-slate-700">Pilihan Jawaban</label>
                        <button
                            onClick={addOption}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Opsi
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.options.map((opt, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 group">
                                <GripVertical className="w-5 h-5 text-slate-400 mt-2 cursor-move" />

                                <div className="flex-1 space-y-3">
                                    <input
                                        type="text"
                                        value={opt.text}
                                        onChange={(e) => updateOption(idx, 'text', e.target.value)}
                                        placeholder={`Opsi ${idx + 1}`}
                                        className="w-full rounded-md border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={opt.isCorrect}
                                                onChange={(e) => updateOption(idx, 'isCorrect', e.target.checked)}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-600 font-medium">Benaaar?</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">Bobot:</span>
                                            <input
                                                type="number"
                                                value={opt.score}
                                                onChange={(e) => updateOption(idx, 'score', parseFloat(e.target.value))}
                                                className="w-20 rounded-md border-slate-200 text-sm py-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeOption(idx)}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
