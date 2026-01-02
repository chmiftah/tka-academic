"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    BookOpen,
    BarChart3,
    Award,
    CheckCircle2,
    Brain,
    Sparkles,
    ArrowRight,
    PlayCircle,
    GraduationCap,
    School,
    Menu,
    X,
    ChevronDown,
    Star
} from "lucide-react";
import { useState, useEffect } from "react";

const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" }
} as const;

const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } }
};

export default function LandingClient() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-cyan-900">

            {/* --- Navbar (Floating Glass) --- */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-3"
                    : "bg-transparent py-6"
                    }`}
            >
                <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <Brain className="w-6 h-6" />
                        </div>
                        <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-slate-800' : 'text-slate-900'}`}>
                            TKA <span className="text-blue-600">CBT</span>
                        </span>
                    </div>

                    <div className="hidden lg:flex items-center gap-8">
                        {['Jenjang', 'Fitur', 'Keunggulan', 'Testimoni'].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm font-bold text-slate-600 hover:text-blue-600 px-4 py-2 rounded-full hover:bg-blue-50 transition-all"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/register"
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Daftar Gratis
                        </Link>
                    </div>

                    <button
                        className="lg:hidden p-2 text-slate-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            {/* --- Hero Section --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-blue-200/30 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/4 animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-cyan-200/30 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/4" />

                <div className="container mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="max-w-2xl"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold mb-8">
                                <Sparkles className="w-4 h-4 text-orange-400" />
                                <span>Platform Ujian No.1 di Indonesia</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                                Platform Ujian & <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                                    Belajar Online
                                </span>
                            </h1>

                            <p className="text-lg lg:text-xl text-slate-600 mb-10 leading-relaxed">
                                Latihan soal Kurikulum Merdeka, Analisis Nilai Real-time, dan Pembahasan Lengkap.
                                Siap hadapi ulangan harian hingga ujian sekolah.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white text-lg font-bold px-8 py-4 rounded-[20px] shadow-xl hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    Mulai Sekarang
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <button className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 text-lg font-bold px-8 py-4 rounded-[20px] border border-slate-200 shadow-sm hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group">
                                    <PlayCircle className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                    Lihat Demo
                                </button>
                            </div>

                            <div className="mt-12 flex items-center gap-8">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative">
                                            <Image
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                                                alt="User"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                        +10k
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-slate-600">
                                    <span className="text-slate-900 font-bold block">10.000+ Siswa & Guru</span>
                                    Telah bergabung
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative max-w-[320px] lg:max-w-[360px] mx-auto"
                        >
                            <div className="relative z-10 rounded-[32px] overflow-hidden shadow-2xl shadow-blue-900/10 border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
                                <Image
                                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600"
                                    alt="Student Learning"
                                    width={360}
                                    height={450}
                                    priority
                                    className="object-cover w-full h-auto"
                                />

                                {/* Floating Card 1 */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase">Status</div>
                                        <div className="text-sm font-bold text-slate-800">Lulus Ujian!</div>
                                    </div>
                                </motion.div>

                                {/* Floating Card 2 */}
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute top-12 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-xs text-slate-500 font-bold uppercase">Nilai Rata-rata</div>
                                        <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                                    </div>
                                    <div className="text-2xl font-extrabold text-slate-800">98.5</div>
                                </motion.div>
                            </div>

                            {/* Decorative Blob behind image */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-[50px] -z-10 blur-md translate-x-4 translate-y-4" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Level Selection (Bento Grid) --- */}
            <section className="py-24 bg-white" id="jenjang">
                <div className="container mx-auto px-6 lg:px-12">
                    <motion.div
                        {...fadeInUp}
                        className="text-center max-w-2xl mx-auto mb-16"
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                            Pilih Jenjang Belajarmu
                        </h2>
                        <p className="text-lg text-slate-600">
                            Materi yang disesuaikan dengan kurikulum nasional untuk setiap tingkat pendidikan.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-6 lg:gap-8"
                    >
                        {[
                            {
                                title: "SD / MI",
                                subtitle: "Kelas 1-6",
                                desc: "Latihan Tematik & Asesmen Nasional (ANBK)",
                                icon: BookOpen,
                                color: "bg-orange-50 text-orange-600 border-orange-100 hover:shadow-orange-100"
                            },
                            {
                                title: "SMP / MTs",
                                subtitle: "Kelas 7-9",
                                desc: "Persiapan Ujian Sekolah & Olimpiade Sains",
                                icon: School,
                                color: "bg-blue-50 text-blue-600 border-blue-100 hover:shadow-blue-100"
                            },
                            {
                                title: "SMA / MA",
                                subtitle: "Kelas 10-12",
                                desc: "Siap UTBK SNBT & Ujian Mandiri PTN",
                                icon: GraduationCap,
                                color: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:shadow-indigo-100"
                            }
                        ].map((level, idx) => (
                            <motion.div
                                key={idx}
                                variants={{
                                    initial: { opacity: 0, y: 30 },
                                    whileInView: { opacity: 1, y: 0 }
                                }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className={`
                                    relative p-8 rounded-[32px] border ${level.color.split(' ')[2]} 
                                    bg-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl
                                    ${level.color.split(' ').pop()}
                                `}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-xl ${level.color.split(' ').slice(0, 2).join(' ')}`}>
                                    <level.icon className="w-7 h-7" />
                                </div>
                                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-3">
                                    {level.subtitle}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{level.title}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {level.desc}
                                </p>
                                <div className="mt-8 flex items-center text-sm font-bold opacity-60 group-hover:opacity-100 transition-opacity">
                                    Lihat Materi <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- Features Section --- */}
            <section className="py-24 bg-slate-50 overflow-hidden" id="fitur">
                <div className="container mx-auto px-6 lg:px-12">
                    {/* Feature 1 */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2"
                        >
                            <div className="relative rounded-[32px] overflow-hidden shadow-2xl border-8 border-white">
                                <Image
                                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000"
                                    alt="CBT Interface"
                                    width={600}
                                    height={400}
                                    className="object-cover w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                    <div className="text-white">
                                        <div className="text-sm font-bold uppercase tracking-wider mb-1 text-cyan-300">Technology</div>
                                        <div className="text-2xl font-bold">Interface Ujian Modern</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <div className="lg:w-1/2">
                            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                                Simulasi CBT Mirip <span className="text-blue-600">Asli</span>
                            </h3>
                            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                Biasakan diri dengan tampilan dan sistem ujian berbasis komputer (CBT/CAT) yang digunakan dalam ujian nasional maupun seleksi masuk perguruan tinggi.
                            </p>
                            <ul className="space-y-4">
                                {['Timer Real-time', 'Navigasi Soal Mudah', 'Auto-Save Jawaban', 'Responsive di Tablet & HP'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2"
                        >
                            <div className="p-8 bg-white rounded-[32px] shadow-xl border border-slate-200">
                                {/* Fake Chart */}
                                <div className="flex items-end justify-between h-64 gap-4 mb-4">
                                    {[40, 65, 45, 80, 60, 95].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${h}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="w-full bg-blue-100 rounded-t-xl relative group"
                                        >
                                            <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-xl transition-all duration-500 group-hover:bg-cyan-400" style={{ height: '100%' }} />
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                                    <span>Tryout 1</span>
                                    <span>Tryout 6</span>
                                </div>
                            </div>
                        </motion.div>
                        <div className="lg:w-1/2">
                            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                                Analisis Nilai <span className="text-blue-600">Juara</span>
                            </h3>
                            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                Pantau perkembangan belajarmu dengan grafik analisis yang mendalam. Ketahui kelemahan dan kekuatanmu di setiap mata pelajaran secara instan.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <BarChart3 className="w-8 h-8 text-cyan-500 mb-3" />
                                    <div className="font-bold text-slate-900 text-lg">Grafik Progres</div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <Award className="w-8 h-8 text-orange-500 mb-3" />
                                    <div className="font-bold text-slate-900 text-lg">Ranking Nasional</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA / Footer --- */}
            <footer className="bg-slate-900 text-white pt-24 pb-12 rounded-t-[40px] mt-12">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row justify-between gap-12 mb-20 border-b border-slate-800 pb-16">
                        <div className="lg:w-1/3">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight">
                                    TKA CBT
                                </span>
                            </div>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Platform evaluasi pendidikan terpadu untuk indonesia yang lebih cerdas.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-16">
                            <div>
                                <h4 className="font-bold text-lg mb-6">Program</h4>
                                <ul className="space-y-4 text-slate-400">
                                    <li><a href="#" className="hover:text-blue-400 transition-colors">SD / MI</a></li>
                                    <li><a href="#" className="hover:text-blue-400 transition-colors">SMP / MTs</a></li>
                                    <li><a href="#" className="hover:text-blue-400 transition-colors">SMA / MA</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-6">Perusahaan</h4>
                                <ul className="space-y-4 text-slate-400">
                                    <li><a href="#" className="hover:text-blue-400 transition-colors">Tentang Kami</a></li>
                                    <li><a href="#" className="hover:text-blue-400 transition-colors">Hubungi Kami</a></li>
                                    <li><a href="#" className="hover:text-blue-400 transition-colors">Karir</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-6">Legal</h4>
                                <ul className="space-y-4 text-slate-400">
                                    <li><a href="#" className="hover:text-blue-400 transition-colors">Privasi</a></li>
                                    <li><a href="#" className="hover:text-blue-400 transition-colors">Syarat</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-slate-500 text-sm">
                        &copy; 2026 TKA CBT System. All rights reserved. Made with ❤️ in Indonesia.
                    </div>
                </div>
            </footer>
        </div>
    );
}
