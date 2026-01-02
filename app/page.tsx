import { BookOpen, BarChart3, Clock, Users, Award, ChevronRight, Star, Target, CheckCircle2, Brain, Sparkles } from "lucide-react";
import Link from "next/link";
import LandingHeader from "@/components/LandingHeader";

export default function Home() {
  const stats = [
    { number: "50,000+", label: "Siswa Aktif", icon: Users },
    { number: "95%", label: "Kepuasan Pengguna", icon: Star },
    { number: "24/7", label: "Akses Platform", icon: Clock },
    { number: "5000+", label: "Soal Terupdate", icon: Brain },
  ];

  const testimonials = [
    { name: "Rina Putri", school: "SMA Negeri 1 Jakarta", text: "Platform ini membantu saya masuk PTN favorit!" },
    { name: "Andi Wijaya", school: "SMP Negeri 3 Bandung", text: "Sistem penilaiannya sangat akurat dan membantu." },
    { name: "Sari Dewi", school: "SMA Internasional", text: "Bank soalnya lengkap dan selalu update." },
  ];

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-blue-200 mb-6 shadow-sm">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-blue-700">Platform No. 1 di Indonesia</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Uji Potensi Akademik
                  <span className="block text-blue-600">Raih Prestasi Terbaikmu</span>
                </h1>

                <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl">
                  Platform evaluasi pendidikan terpadu untuk mengukur dan meningkatkan potensi akademik siswa di seluruh Indonesia dengan metode terkini.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Mulai Ujian Gratis
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="#demo"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-lg border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                  >
                    Lihat Demo
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-12 flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-slate-600">100% sesuai kurikulum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-slate-600">Sertifikat resmi</span>
                  </div>
                </div>
              </div>

              {/* Hero Illustration */}
              <div className="relative">
                <div className="relative bg-blue-600 rounded-2xl p-8 shadow-2xl">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-white/30 rounded-full w-3/4" />
                      <div className="h-4 bg-white/30 rounded-full w-1/2" />
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="h-20 bg-white/20 rounded-xl" />
                        <div className="h-20 bg-white/20 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Mengapa Bergabung dengan <span className="text-blue-600">TKA?</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Platform revolusioner yang mengubah cara belajar dan evaluasi akademik
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100 hover:border-blue-200">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-blue-100 text-blue-600 mb-6">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bank Soal AI-Powered</h3>
              <p className="text-slate-600">
                Ribuan soal adaptif yang menyesuaikan kesulitan berdasarkan kemampuanmu, disusun oleh ahli kurikulum.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100 hover:border-blue-200">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-blue-100 text-blue-600 mb-6">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Analisis Mendalam</h3>
              <p className="text-slate-600">
                Sistem IRT memberikan analisis kemampuan detail dan rekomendasi pembelajaran personal.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100 hover:border-blue-200">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-blue-100 text-blue-600 mb-6">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sertifikasi Nasional</h3>
              <p className="text-slate-600">
                Dapatkan sertifikat resmi yang diakui sekolah dan institusi pendidikan di Indonesia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Levels */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Program untuk Semua <span className="text-blue-600">Jenjang</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Materi sesuai kurikulum terbaru untuk setiap tingkat pendidikan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                level: "SD / MI",
                subjects: ["Matematika Dasar", "Bahasa Indonesia", "IPA Terpadu", "PPKN"],
                color: "red",
                students: "Kelas 1-6"
              },
              {
                level: "SMP / MTs",
                subjects: ["Matematika", "IPA", "IPS", "Bahasa Inggris"],
                color: "blue",
                students: "Kelas 7-9"
              },
              {
                level: "SMA / MA",
                subjects: ["Matematika IPA/IPS", "Fisika/Kimia", "Biologi/Ekonomi", "Bahasa Asing"],
                color: "slate",
                students: "Kelas 10-12"
              },
            ].map((program) => (
              <div key={program.level} className="group relative overflow-hidden rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300">
                <div className="relative bg-white p-8">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${program.color === 'red' ? 'bg-red-50 text-red-600' :
                    program.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    } mb-6`}>
                    <span className="text-sm font-semibold">
                      {program.students}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{program.level}</h3>
                  <ul className="space-y-3 mb-8">
                    {program.subjects.map((subject) => (
                      <li key={subject} className="flex items-center text-slate-600">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                        {subject}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/program/${program.level.toLowerCase().replace(/[\/\s]/g, '-')}`}
                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 group/link"
                  >
                    Lihat detail program
                    <ChevronRight className="h-5 w-5 ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Kata <span className="text-blue-600">Mereka</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Ribuan siswa telah meraih prestasi lebih baik
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-lg mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-slate-600 text-sm">{testimonial.school}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Siap Tingkatkan Prestasi Akademikmu?
            </h2>
            <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
              Bergabung dengan ribuan siswa lainnya dan raih hasil terbaik
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/daftar"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-10 py-4 text-lg font-semibold text-blue-600 shadow-2xl hover:bg-blue-50 hover:scale-[1.02] transition-all duration-300"
              >
                Daftar Sekarang Gratis
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-xl bg-transparent px-10 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white/10 transition-all duration-300"
              >
                Coba Demo Gratis
              </Link>
            </div>
            <p className="mt-6 text-sm text-blue-200">
              Gratis 7 hari pertama • Tidak perlu kartu kredit
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">TKA System</div>
              <p className="text-slate-400">
                Platform evaluasi pendidikan terdepan di Indonesia.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Program</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/program/sd" className="hover:text-white transition-colors">SD/MI</Link></li>
                <li><Link href="/program/smp" className="hover:text-white transition-colors">SMP/MTs</Link></li>
                <li><Link href="/program/sma" className="hover:text-white transition-colors">SMA/MA</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/tentang" className="hover:text-white transition-colors">Tentang Kami</Link></li>
                <li><Link href="/karir" className="hover:text-white transition-colors">Karir</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privasi</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Bantuan</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} TKA System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}