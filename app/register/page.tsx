"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { Loader2 } from "lucide-react";

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
            setMessage("Passwords do not match.");
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
            setMessage("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
                    <p className="mt-2 text-sm text-slate-500">Join us to start your learning journey</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200 animate-in fade-in slide-in-from-top-2">
                            {message}
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                        >
                            {loading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
