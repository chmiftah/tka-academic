
import { Book, ChartLine, Zap, GraduationCap, CheckCircle } from "lucide-react";
import Link from "next/link";
import LandingHeader from "@/components/LandingHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-16 pb-32 lg:pt-32 lg:pb-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Uji Kompetensi Akademik{" "}
              <span className="text-blue-600 block sm:inline">Standar Nasional</span>
            </h1>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
              Platform evaluasi pendidikan terpadu untuk mengukur dan meningkatkan potensi akademik siswa di seluruh Indonesia.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
              >
                Mulai Ujian Sekarang
              </Link>
              <Link
                href="#features"
                className="rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Mengapa Memilih TKA?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Fitur unggulan untuk mendukung proses evaluasi yang efektif dan akurat.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Book className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bank Soal Berkualitas</h3>
              <p className="text-slate-600">
                Ribuan soal terstandarisasi yang disusun oleh tim ahli kurikulum nasional untuk berbagai jenjang.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                <ChartLine className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sistem Penilaian Modern</h3>
              <p className="text-slate-600">
                Analisis mendalam menggunakan metode Item Response Theory (IRT) untuk akurasi tingkat kemampuan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Hasil Real-time</h3>
              <p className="text-slate-600">
                Dapatkan laporan hasil ujian dan analisis performa siswa segera setelah ujian selesai dilaksanakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Education Levels */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Jenjang Pendidikan
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Materi ujian disesuaikan dengan kurikulum nasional untuk setiap tingkatan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { level: "SD / MI", color: "bg-red-500", text: "text-red-500", bg: "bg-red-50" },
              { level: "SMP / MTs", color: "bg-blue-600", text: "text-blue-600", bg: "bg-blue-50" },
              { level: "SMA / MA", color: "bg-slate-500", text: "text-slate-500", bg: "bg-slate-100" },
            ].map((item) => (
              <div key={item.level} className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200">
                <div className={`absolute top-0 right-0 p-4 opacity-10`}>
                  <GraduationCap className={`h-24 w-24 ${item.text}`} />
                </div>
                <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-semibold mb-6 ${item.bg} ${item.text}`}>
                  Level Dasar
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.level}</h3>
                <ul className="space-y-3 mb-8">
                  {['Matematika', 'Bahasa Indonesia', 'IPA/IPS Terpadu'].map((subject) => (
                    <li key={subject} className="flex items-start text-slate-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      {subject}
                    </li>
                  ))}
                </ul>
                <Link href="#" className={`inline-flex items-center text-sm font-semibold ${item.text} hover:opacity-80`}>
                  Lihat Detail Kurikulum &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold text-slate-900">TKA System</span>
              <p className="text-slate-500 text-sm mt-1">
                © {new Date().getFullYear()} TKA System. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-slate-500 hover:text-slate-900">Tentang Kami</Link>
              <Link href="#" className="text-slate-500 hover:text-slate-900">Privasi</Link>
              <Link href="#" className="text-slate-500 hover:text-slate-900">Syarat & Ketentuan</Link>
              <Link href="#" className="text-slate-500 hover:text-slate-900">Bantuan</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
