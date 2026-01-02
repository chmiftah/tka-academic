import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import { createClient } from "@/utils/supabase/client";// Sesuaikan 
import { notFound } from 'next/navigation';

async function getPackageDetail(id: string) {
    const supabase = createClient();

    // Fetch detail paket + subjects
    const { data, error } = await supabase
        .from('exam_packages')
        .select(`
      *,
      package_subjects (
        subject:subjects (id, name)
      )
    `)
        .eq('id', id)
        .single();

    if (error || !data) return null;

    return {
        ...data,
        subjects: data.package_subjects.map((ps: any) => ps.subject)
    };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pkg = await getPackageDetail(id);

    if (!pkg) return notFound();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">

                {/* Header Biru */}
                <div className="bg-blue-600 px-8 py-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">{pkg.title}</h1>
                    <p className="text-blue-100 text-sm">Harap baca instruksi sebelum memulai.</p>
                </div>

                <div className="p-8">
                    {/* Informasi Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-8 border-b pb-8">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Waktu Pengerjaan</p>
                            <p className="font-semibold text-gray-900">120 Menit</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Soal</p>
                            <p className="font-semibold text-gray-900">40 Butir</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Waktu Mulai</p>
                            <p className="font-semibold text-gray-900">{new Date(pkg.start_at).toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Sistem Penilaian</p>
                            <p className="font-semibold text-gray-900">Standard TKA</p>
                        </div>
                    </div>

                    {/* Daftar Mata Pelajaran */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mata Pelajaran yang Diujikan</h3>
                        <ul className="space-y-3">
                            {pkg.subjects.map((sub: any, idx: number) => (
                                <li key={sub.id} className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold mr-3">
                                        {idx + 1}
                                    </span>
                                    {sub.name}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Instruksi Penting */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                        <h4 className="text-yellow-800 font-semibold mb-2 flex items-center gap-2">
                            ⚠️ Perhatian
                        </h4>
                        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                            <li>Pastikan koneksi internet Anda stabil.</li>
                            <li>Waktu akan berjalan otomatis setelah tombol Mulai ditekan.</li>
                            <li>Jangan refresh halaman selama ujian berlangsung.</li>
                        </ul>
                    </div>

                    {/* Action Button */}
                    <Link
                        href={`/exam/${pkg.id}`}
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                    >
                        Mulai Kerjakan Sekarang
                    </Link>

                    <div className="mt-4 text-center">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 text-sm">
                            Kembali ke Dashboard
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}