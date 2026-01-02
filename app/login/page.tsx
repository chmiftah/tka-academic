"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/app/auth/actions";
import { Loader2, Mail, Lock, ArrowRight, BookOpen } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);

        try {
            const response = await login(formData);

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
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1470&auto=format&fit=crop"
                    alt="Students learning"
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
                            Masa depanmu dimulai <span className="text-yellow-300">hari ini.</span>
                        </h2>
                        <p className="text-lg text-indigo-100 font-medium leading-relaxed">
                            "Pendidikan adalah tiket ke masa depan. Hari esok dimiliki oleh orang-orang yang mempersiapkannya hari ini."
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-indigo-600 bg-slate-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm font-semibold">
                                <span className="text-yellow-300">5,000+</span> Siswa telah bergabung
                            </div>
                        </div>
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

                <div className="w-full max-w-md space-y-10">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Selamat Datang Kembali! 👋
                        </h1>
                        <p className="text-slate-500 text-lg">
                            Siap untuk melanjutkan belajarmu hari ini?
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
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
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="password">
                                        Password
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
                                    >
                                        Lupa password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
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
                                    Masuk Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-medium">atau</span>
                            </div>
                        </div>

                        <p className="text-center text-slate-600 font-medium">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-all">
                                Daftar Sekarang
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
