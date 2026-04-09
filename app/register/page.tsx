'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import NetworkBackground from '../components/layout/NetworkBackground';
import { authService } from '../../lib/auth-service';

export default function RegisterPortal() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim() && email.trim() && password.trim()) {
      setLoading(true);
      setError(null);
      const res = await authService.signUp(email, password, fullName);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(res.error || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      dir="rtl"
      style={{ fontFamily: 'var(--font-arabic)' }}
    >
      <div className="fixed inset-0 grid-bg z-0" style={{ opacity: 0.4 }} />
      
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{
          width: '700px', height: '500px',
          background: 'radial-gradient(ellipse at center top, rgba(6,182,212,0.1) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div
          style={{
            background: 'rgba(9,15,33,0.8)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(6,182,212,0.2)',
            borderRadius: '2.5rem',
            padding: 'clamp(2rem, 6vw, 3.5rem)',
            boxShadow: '0 0 60px rgba(6,182,212,0.08), 0 32px 64px rgba(0,0,0,0.6)',
            textAlign: 'center',
          }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ marginBottom: '1.75rem' }}
          >
            <div
              style={{
                width: '80px', height: '80px',
                margin: '0 auto',
                background: 'linear-gradient(135deg, var(--accent-cyan-dark), #6366f1)',
                borderRadius: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.25rem',
                boxShadow: '0 0 32px rgba(99,102,241,0.4)',
              }}
            >
              🚀
            </div>
          </motion.div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 2rem)',
              fontWeight: 900,
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              marginBottom: '0.6rem',
            }}
          >
            انضم للأبطال
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
              fontSize: '0.95rem',
            }}
          >
            أنشئ حسابك الخارق الآن لبدء مغامرة التعلّم.
          </p>

          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <p>تم إنشاء الحساب بنجاح!</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>جاري الانتقال لصفحة الدخول...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{ color: '#ff4b4b', fontSize: '0.8rem', background: 'rgba(255,75,75,0.1)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid rgba(255,75,75,0.2)' }}>
                  {error}
                </div>
              )}
              
              <input
                type="text"
                placeholder="الاسم الكامل للبطل..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  background: 'rgba(2,6,23,0.8)',
                  border: `2px solid ${focused === 'name' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '1.25rem',
                  padding: '1.1rem 1.5rem',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />

              <input
                type="email"
                placeholder="البريد الإلكتروني..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  background: 'rgba(2,6,23,0.8)',
                  border: `2px solid ${focused === 'email' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '1.25rem',
                  padding: '1.1rem 1.5rem',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />

              <input
                type="password"
                placeholder="كلمة المرور..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                required
                style={{
                  width: '100%',
                  background: 'rgba(2,6,23,0.8)',
                  border: `2px solid ${focused === 'password' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '1.25rem',
                  padding: '1.1rem 1.5rem',
                  color: 'var(--text-primary)',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1.1rem',
                  background: 'linear-gradient(135deg, var(--accent-cyan-dark), #6366f1)',
                  border: 'none',
                  borderRadius: '1.25rem',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
                }}
              >
                {loading ? 'جاري الانطلاق...' : 'بدء المهمة'}
              </motion.button>
            </form>
          )}

          <div style={{ marginTop: '2.5rem' }}>
            <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
              لديك حساب بالفعل؟ <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>سجل دخولك هنا</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
