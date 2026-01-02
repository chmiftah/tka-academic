"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { Loader2, Mail, Lock, User, ArrowRight, BookOpen } from "lucide-react";

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setMessage("Password tidak sama");
            setLoading(false);
            return;
        }

        try {
            const response = await signup(formData);

            if (response && response.error) {
                setMessage(response.error);
            }
        } catch (error) {
            console.error("Auth error:", error);
            setMessage("Terjadi kesalahan yang tidak terduga.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
            {/* Left Side - Image & Motivation */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 overflow-hidden">
                <div className="absolute inset-0 bg-indigo-900/40 mix-blend-multiply z-10" />
                <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop"
                    alt="Students studying group"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="relative z-20 flex flex-col justify-between h-full p-16 text-white">
                    <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <span>Tryout TKA</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h2 className="text-5xl font-extrabold leading-tight">
                            Gapai mimpimu <br />
                            <span className="text-yellow-300">bersama kami.</span>
                        </h2>
                        <ul className="space-y-4 text-lg text-indigo-100 font-medium">
                            <li className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center border border-green-400/50 text-green-300 text-sm">✓</div>
                                Akses ribuan soal latihan
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center border border-green-400/50 text-green-300 text-sm">✓</div>
                                Pembahasan detail & lengkap
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center border border-green-400/50 text-green-300 text-sm">✓</div>
                                Monitor progres belajar
                            </li>
                        </ul>
                    </div>

                    <div className="text-sm text-indigo-200 font-medium">
                        © 2026 Tryout TKA. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white relative">
                {/* Mobile Background Decoration */}
                <div className="absolute inset-0 bg-slate-50 lg:hidden -z-10" />

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Buat Akun Baru 🚀
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Daftar sekarang dan mulai belajar!
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="fullName">
                                    Nama Lengkap
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        placeholder="John Doe"
                                        className="block w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">
                                    Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="contoh@email.com"
                                        className="block w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        placeholder="••••••••"
                                        className="block w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="confirmPassword">
                                    Konfirmasi Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        placeholder="••••••••"
                                        className="block w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-sm font-medium flex items-center animate-in slide-in-from-top-2 fade-in">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2.5" />
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl
                                text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600
                                hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20
                                shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]
                                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                                transition-all duration-200
                            "
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Daftar Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>

                        <p className="text-center text-slate-600 font-medium pt-4">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-all">
                                Masuk disini
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
