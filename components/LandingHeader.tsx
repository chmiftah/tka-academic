"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function LandingHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Beranda", href: "#hero" },
        { name: "Fitur", href: "#features" },
        { name: "Jenjang", href: "#levels" },
        { name: "Tentang", href: "#about" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 py-3" : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl group-hover:bg-blue-700 transition-colors">
                            TKA
                        </div>
                        <span className={`text-xl font-bold ${isScrolled ? 'text-slate-900' : 'text-slate-900'} transition-colors`}>
                            System
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium hover:text-blue-600 transition-colors ${isScrolled ? "text-slate-600" : "text-slate-600"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/login"
                            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${isScrolled ? "text-slate-600 hover:text-blue-600" : "text-slate-600 hover:text-blue-600"
                                }`}
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/register"
                            className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all hover:shadow-lg"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-slate-600 hover:text-blue-600 font-medium py-2 px-2 rounded-md hover:bg-slate-50"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <hr className="border-slate-100 my-2" />
                    <Link
                        href="/login"
                        className="text-center w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Masuk Akun
                    </Link>
                    <Link
                        href="/register"
                        className="text-center w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Daftar Sekarang
                    </Link>
                </div>
            )}
        </header>
    );
}
