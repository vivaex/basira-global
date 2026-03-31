import "./globals.css";
import TopNavbar from "./components/TopNavbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#020617] text-slate-200">
        <TopNavbar />
        
        {/* حطينا pt-28 عشان أول الكلام يبدأ تحت الناف بار بالظبط */}
        <main className="relative z-10 pt-28">
          {children}
        </main>
      </body>
    </html>
  );
}