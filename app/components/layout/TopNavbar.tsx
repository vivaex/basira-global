'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../LanguageContext';
import { useSound } from '@/hooks/useSound';
import { 
  getStudentProfile, 
  getAllProfiles, 
  setCurrentProfileId, 
  StudentProfile 
} from '@/lib/studentProfile';
import { authService } from '@/lib/auth-service';

export default function TopNavbar() {
  const { language, setLanguage, t, dir } = useLanguage();
  const { play } = useSound();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<StudentProfile[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChildMenuOpen, setIsChildMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const NAV_LINKS = [
    { href: '/diagnose', label: t('labs'), icon: '🧬' },
    { href: '/diagnose/results', label: t('reports'), icon: '📊' },
    { href: '/diagnose/passport', label: t('passport'), icon: '🪪' },
  ];

  useEffect(() => {
    const p = getStudentProfile();
    if (p) setProfile(p);
    setAllProfiles(getAllProfiles());
    
    // Listen for storage changes (for sync across tabs)
    const handleStorage = () => {
      setProfile(getStudentProfile());
      setAllProfiles(getAllProfiles());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setIsChildMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSwitchProfile = (id: string) => {
    play('click');
    setCurrentProfileId(id);
    setProfile(getStudentProfile());
    setIsChildMenuOpen(false);
    setIsMenuOpen(false);
    router.refresh();
  };

  const toggleLanguage = () => {
    play('click');
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = async () => {
    play('click');
    await authService.signOut();
    localStorage.removeItem('basira_current_profile_id');
    localStorage.removeItem('studentName');
    setProfile(null);
    setIsMenuOpen(false);
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-500"
      style={{ 
        height: scrolled ? '70px' : '90px',
        background: scrolled ? 'rgba(5, 5, 8, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto h-full flex justify-between items-center px-6 md:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group" style={{ textDecoration: 'none' }} onClick={() => play('click')}>
          <div
            className="flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{
              width: '42px', height: '42px',
              background: 'linear-gradient(135deg, var(--accent-cyan-dark), var(--accent-blue))',
              borderRadius: '14px',
              boxShadow: '0 0 20px rgba(6,182,212,0.4)',
            }}
          >
            <span className="text-white font-black italic text-xl" style={{ fontFamily: 'var(--font-arabic)' }}>ب</span>
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-black text-xl italic text-white" style={{ fontFamily: 'var(--font-arabic)' }}>{language === 'ar' ? 'بَصيرة' : 'BASIRA'}</span>
            <span className="text-[0.55rem] text-cyan-400 font-mono tracking-widest uppercase opacity-80">Sovereign Intel</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => play('click')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold italic text-sm ${
                isActive(link.href) ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white'
              }`}
              style={{ textDecoration: 'none' }}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
              {isActive(link.href) && <span className="w-1 h-1 rounded-full bg-cyan-400 block" />}
            </Link>
          ))}
        </div>

        {/* Action Belt */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-xs font-black hover:border-cyan-500/50 transition-all text-slate-400 hover:text-cyan-400"
          >
            {language === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* User Section */}
          <div className="relative" ref={menuRef}>
            {profile ? (
              <div className="flex items-center gap-2">
                {/* Level Tag (Mobile/Desktop) */}
                <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 px-3 py-1 rounded-full hidden lg:flex items-center gap-1.5">
                   <span className="text-[10px] font-black text-amber-500 uppercase">{t('lvl')}</span>
                   <span className="text-sm font-black text-white">{profile.level || 1}</span>
                </div>

                <button
                  id="user-menu-btn"
                  onClick={() => { setIsMenuOpen(!isMenuOpen); play('click'); }}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-[0.6rem] text-cyan-400 font-mono tracking-widest leading-none mb-1 uppercase">{t('hero')}</p>
                    <p className="text-sm font-black text-white italic">{profile.name}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg shadow-lg">
                    🤖
                  </div>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => play('click')}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6 py-2.5 rounded-2xl text-sm transition-all flex items-center gap-2"
                style={{ textDecoration: 'none' }}
              >
                <span>{t('login')}</span>
                <span className="text-lg">🛡️</span>
              </Link>
            )}

            {/* Dropdown */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-3 shadow-2xl z-[110]"
                >
                  <div className="p-3 border-b border-white/5 mb-2">
                    <p className="text-[10px] font-mono tracking-widest text-cyan-400 mb-1 uppercase">{t('sovereign_access')}</p>
                    <div className="flex justify-between items-center">
                      <p className="font-black text-white italic">{profile?.name}</p>
                      <span className="bg-cyan-500/10 text-cyan-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-cyan-500/20">
                        {profile?.xp || 0} XP
                      </span>
                    </div>
                  </div>

                  {/* Switch Child Menu */}
                  <div className="mb-2">
                    <button 
                       onClick={() => { setIsChildMenuOpen(!isChildMenuOpen); play('click'); }}
                       className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all text-sm font-bold text-slate-400 hover:text-white"
                    >
                       <span className="flex items-center gap-3">👥 {t('switch_child')}</span>
                       <span className="text-xs transition-transform" style={{ transform: isChildMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                    </button>
                    
                    <AnimatePresence>
                      {isChildMenuOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white/5 rounded-2xl mt-1">
                          {allProfiles.map(p => (
                            <button
                              key={p.id}
                              onClick={() => handleSwitchProfile(p.id)}
                              className={`w-full text-right p-3 text-xs font-bold transition-all border-b border-white/5 last:border-0 ${
                                p.id === profile?.id ? 'text-cyan-400 bg-cyan-400/5' : 'text-slate-500 hover:text-white'
                              }`}
                            >
                              {p.name} {p.id === profile?.id && '●'}
                            </button>
                          ))}
                          <Link href="/diagnose/profile" onClick={() => play('click')} className="block w-full text-right p-3 text-xs font-black text-indigo-400 hover:bg-indigo-400/10 transition-all" style={{ textDecoration: 'none' }}>
                            + {t('add_profile')}
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link href="/diagnose/results" onClick={() => { setIsMenuOpen(false); play('click'); }} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-sm font-bold text-slate-400 hover:text-white transition-all" style={{ textDecoration: 'none' }}>
                    <span>📊</span> {t('my_results')}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 mt-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-black italic transition-all border border-rose-500/10"
                  >
                    <span>↩️</span> {t('logout')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
