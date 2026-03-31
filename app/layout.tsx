import TopNavbar from './components/TopNavbar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#020617] text-white flex flex-col">
        {/* هاد هو السايد بار العلوي اللي رح يظهر بكل الصفحات */}
        <TopNavbar />
        
        {/* الـ pt-24 ضرورية عشان المحتوى ما يختفي تحت الناف بار */}
        <main className="flex-grow pt-24">
          {children}
        </main>

        <footer className="py-8 text-center text-slate-700 font-mono text-xs border-t border-white/5">
          BASIRA_SYSTEM_PROTECTED // 2026
        </footer>
      </body>
    </html>
  );
}