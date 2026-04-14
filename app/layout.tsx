import type { Metadata } from "next";
import "./globals.css";
import TopNavbar from "./components/layout/TopNavbar";
import { LanguageProvider } from "./components/LanguageContext";
import PageTransition from "./components/ui/PageTransition";
import CloudSyncInitializer from "./components/CloudSyncInitializer";

export const metadata: Metadata = {
  title: "منظومة بَصيرة | السيادة الرقمية لتشخيص صعوبات التعلم",
  description: "بَصيرة — المركز الرقمي السيادي الأول من نوعه لتشخيص وعلاج صعوبات التعلم عند الأطفال بأدوات القرن الحادي والعشرين.",
  keywords: ["بصيرة", "صعوبات التعلم", "تشخيص", "أطفال", "التعليم الرقمي"],
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" />
      </head>
      <body className="min-h-screen text-slate-200" style={{ background: 'var(--bg-primary)', fontFamily: 'var(--font-arabic)' }}>
        <LanguageProvider>
          <CloudSyncInitializer />
          <TopNavbar />
          <PageTransition>
            <main className="relative z-10 pt-28">
              {children}
            </main>
          </PageTransition>
        </LanguageProvider>
      </body>
    </html>
  );
}