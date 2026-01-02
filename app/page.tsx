import { Metadata } from "next";
import LandingClient from "@/components/LandingClient";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "TKA CBT - Platform Ujian & Belajar Online Terbaik SD, SMP, SMA",
  description: "Platform evaluasi pendidikan terpadu dengan ribuan soal Kurikulum Merdeka, analisis nilai real-time, dan simulasi ujian berbasis komputer (CBT) untuk siswa SD, SMP, dan SMA.",
  keywords: ["CBT", "Ujian Online", "TKA", "Tryout", "Bank Soal", "SD", "SMP", "SMA", "Kurikulum Merdeka"],
};

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <LandingClient user={user} />;
}