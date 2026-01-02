import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TKA System",
  description: "Academic Competency Test System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${roboto.variable}`}>
      <body className="font-sans antialiased text-slate-900 bg-[#FDFCFF]">
        {children}
      </body>
    </html>
  );
}
