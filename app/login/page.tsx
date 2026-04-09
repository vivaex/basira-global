'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import NetworkBackground from '../components/layout/NetworkBackground';
import { authService } from '../../lib/auth-service';
import { syncAllData } from '../../lib/storage';

export default function LoginPortal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      setLoading(true);
      setError(null);
      const res = await authService.signIn(email, password);
      if (res.success) {
        // Sync local data to cloud after successful login
        await syncAllData().catch(err => console.warn('Incremental sync fail:', err));
        router.push('/diagnose');
      } else {
        setError(res.error || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
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
      {/* <NetworkBackground /> */}

      {/* Grid bg */}
      <div className="fixed inset-0 grid-bg z-0" style={{ opacity: 0.4 }} />

      {/* Top glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0"
        style={{
          width: '700px', height: '500px',
          background: 'radial-gradient(ellipse at center top, rgba(6,182,212,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Decorative rings */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.05)' }} />
        <div style={{ position: 'absolute', width: '450px', height: '450px', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.07)' }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.09)' }} />
      </div>

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
          {/* Icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ marginBottom: '1.75rem' }}
          >
            <div
              style={{
                width: '80px', height: '80px',
                margin: '0 auto',
                background: 'linear-gradient(135deg, var(--accent-cyan-dark), var(--accent-blue))',
                borderRadius: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.25rem',
                boxShadow: '0 0 32px rgba(6,182,212,0.4)',
              }}
            >
              🤖
            </div>
          </motion.div>

          {/* Badge */}
          <div style={{ marginBottom: '1rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.6rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.2em',
                color: 'var(--accent-cyan)',
                background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.2)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
              }}
            >
              <span
                className="animate-blink"
                style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block' }}
              />
              SECURE ACCESS PORTAL
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.5rem, 5vw, 2rem)',
              fontWeight: 900,
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              marginBottom: '0.6rem',
              fontFamily: 'var(--font-arabic)',
            }}
          >
            بوابة العبور الآمن
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
              fontFamily: 'var(--font-arabic)',
              fontSize: '0.95rem',
            }}
          >
            أهلاً بك أيها البطل، عرِّفنا بنفسك للبدء.
          </p>

          <form onSubmit={handleAccess} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ 
                  color: '#ff4b4b', 
                  fontSize: '0.8rem', 
                  background: 'rgba(255,75,75,0.1)', 
                  padding: '0.75rem', 
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(255,75,75,0.2)',
                  marginBottom: '0.5rem'
                }}
              >
                {error}
              </motion.div>
            )}
            
            <div style={{ position: 'relative' }}>
              <input
                id="email-input"
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
                  fontSize: '1rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  fontFamily: 'var(--font-arabic)',
                  boxShadow: focused === 'email' ? '0 0 24px rgba(6,182,212,0.15)' : 'none',
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
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
                  fontSize: '1rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  fontFamily: 'var(--font-arabic)',
                  boxShadow: focused === 'password' ? '0 0 24px rgba(6,182,212,0.15)' : 'none',
                }}
              />
            </div>

            <motion.button
              id="login-submit-btn"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              style={{
                width: '100%',
                padding: '1.1rem',
                background: (email.trim() && password.trim())
                  ? 'linear-gradient(135deg, var(--accent-cyan-dark), var(--accent-blue))'
                  : 'rgba(255,255,255,0.06)',
                border: 'none',
                borderRadius: '1.25rem',
                color: (email.trim() && password.trim()) ? '#fff' : 'var(--text-muted)',
                fontSize: '1.1rem',
                fontWeight: 900,
                fontStyle: 'italic',
                cursor: (loading || !email.trim() || !password.trim()) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: (email.trim() && password.trim()) ? '0 8px 32px rgba(6,182,212,0.35)' : 'none',
                fontFamily: 'var(--font-arabic)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <span>{loading ? 'جاري التحقق...' : 'تفعيل المنظومة'}</span>
              <span>{loading ? '⌛' : '🛡️'}</span>
            </motion.button>
          </form>

          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link href="/register" style={{ 
                textDecoration: 'none', 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                color: 'var(--accent-cyan)',
                textAlign: 'center'
              }}>
                إنشاء حساب جديد كبطل خارق 🚀
              </Link>
             <Link href="/clinician/login" style={{ 
               textDecoration: 'none', 
               fontSize: '0.75rem', 
               fontWeight: 900, 
               color: 'rgba(6,182,212,0.6)', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               gap: '0.5rem',
               transition: 'color 0.3s'
             }}
             onMouseEnter={(e: any) => (e.currentTarget.style.color = '#fff')}
             onMouseLeave={(e: any) => (e.currentTarget.style.color = 'rgba(6,182,212,0.6)')}
             >
                <span>📡</span>
                <span>بوابة الأخصائيين والعيادات</span>
             </Link>
          </div>

          {/* Footer note */}
          <p
            style={{
              marginTop: '2rem',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
            }}
          >
            ENCRYPTED · SOVEREIGN · PRIVATE
          </p>
        </div>
      </motion.div>
    </main>
  );
}