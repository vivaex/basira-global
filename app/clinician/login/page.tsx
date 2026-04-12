'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StableFieldInput as FieldInput } from '@/app/components/ui/FormElements';
import { authService } from '@/lib/auth-service';

export const metadata = {
  title: 'بوابة الأخصائيين | بَصيرة',
  description: 'دخول آمن للأخصائيين والعيادات للوصول إلى التحليلات والتقارير السريرية.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// --- Stable Form Component ---
function ClinicianLoginForm({ 
  onSubmit, 
  loading, 
  error, 
  email, setEmail, 
  password, setPassword 
}: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}
      
      <FieldInput
        type="email"
        placeholder="البريد الإلكتروني المهني"
        value={email}
        onChange={setEmail}
        id="clinician-email"
        className="!mb-0"
      />

      <FieldInput
        type="password"
        placeholder="كلمة مرور المركز"
        value={password}
        onChange={setPassword}
        id="clinician-password"
        className="!mb-0"
      />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-cyan-500 hover:bg-cyan-400 py-6 rounded-2xl font-black text-white text-lg italic shadow-2xl transition-all flex items-center justify-center gap-4"
        disabled={loading}
      >
        {loading ? (
          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>تأكيد الهوية</span>
            <span>🔓</span>
          </>
        )}
      </motion.button>
    </form>
  );
}

export default function ClinicianLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await authService.signIn(email, password);
    if (res.success) {
      router.push('/clinician/dashboard');
    } else {
      setError(res.error || 'فشل تسجيل الدخول المهني.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black" dir="rtl">
      {/* <NetworkBackground /> */}
      <div className="fixed inset-0 grid-bg opacity-30 z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg px-6"
      >
        <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/5 p-12 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] text-center">
            
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-800 rounded-3xl mx-auto mb-8 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(30,58,138,0.5)]">🛡️</div>
            
            <h1 className="text-3xl font-black italic mb-2 tracking-tight">بوابة الوصول السريري</h1>
            <p className="text-slate-400 text-sm mb-12 font-medium">أدخل هويتك المهنية للوصول إلى بيانات المركز السيادي.</p>

            <ClinicianLoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={error}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
            />

            <div className="mt-12 flex justify-center gap-8 text-[10px] font-mono text-slate-600 tracking-widest uppercase">
               <span>Clinic ID: BAS_2604</span>
               <span>Region: MENA_SOV</span>
            </div>
        </div>
        
        <div className="mt-8 text-center">
           <button onClick={() => router.push('/login')} className="text-slate-500 hover:text-cyan-400 text-xs font-black transition-all">◀ العودة لبوابة الطلاب</button>
        </div>
      </motion.div>
    </main>
  );
}
