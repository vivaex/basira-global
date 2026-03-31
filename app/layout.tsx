import type { Metadata } from "next";
import "./globals.css";
import TopNavbar from "./components/TopNavbar"; // تأكد من المسار

export const metadata: Metadata = {
  title: "منظومة بَصيرة السيادية",
  description: "المركز الرقمي الأول لتشخيص وعلاج صعوبات التعلم",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#020617] text-slate-200 antialiased selection:bg-cyan-500/30 overflow-x-hidden">
        
        {/* السايد بار العلوي - ثابت دائماً */}
        <TopNavbar />

        {/* pt-32 بتعمل فراغ فوق عشان المحتوى ما يختفي ورا الناف بار الثابت */}
        <main className="relative z-10 pt-32 pb-20">
          {children}
        </main>

        {/* فوتر بسيط سيادي */}
        <footer className="py-10 text-center border-t border-white/5 opacity-20 font-mono text-[10px] tracking-[0.8em] uppercase pointer-events-none">
          Basira_Sovereign_Protocol // 2026
        </footer>
      </body>
    </html>
  );
}