'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getStudentProfile, saveStudentProfile, StudentProfile } from '@/lib/studentProfile';
import BasirRobot from '@/app/components/BasirRobot';

const SHOP_ITEMS = [
  { id: 'skin_gold',  name: 'الدرع الذهبي', type: 'skin',      emoji: '🟡', cost: 50,  desc: 'حول بصير إلى نسخة ذهبية فاخرة!' },
  { id: 'skin_pink',  name: 'الدرع الوردي', type: 'skin',      emoji: '💗', cost: 30,  desc: 'درع رقيق وجميل لأوقات المرح.' },
  { id: 'skin_cyan',  name: 'درع النيون',   type: 'skin',      emoji: '💎', cost: 20,  desc: 'بصير يتوهج باللون السماوي!' },
  { id: 'hat_crown',  name: 'تاج الملوك',   type: 'hat',       emoji: '👑', cost: 100, desc: 'لأبطال بصير الذين أنهوا أصعب التحديات.' },
  { id: 'hat_cap',    name: 'القبعة الرياضية', type: 'hat',    emoji: '🧢', cost: 40,  desc: 'مظهر عصري وسريع لبصير!' },
];

export default function BasiraShop() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);

  useEffect(() => {
    setProfile(getStudentProfile());
  }, []);

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (!profile) return;
    
    if ((profile.coins || 0) < item.cost) {
       setPurchaseFeedback('رصيدك غير كافٍ! العب المزيد من الاختبارات لجمع العملات 💰');
       return;
    }

    const updatedProfile = { ...profile };
    updatedProfile.coins = (updatedProfile.coins || 0) - item.cost;
    updatedProfile.unlockedItems = [...(updatedProfile.unlockedItems || []), item.id];
    
    saveStudentProfile(updatedProfile);
    setProfile(updatedProfile);
    setPurchaseFeedback(`مبروك! لقد حصلت على ${item.name} 🎉`);
    
    setTimeout(() => setPurchaseFeedback(null), 3000);
  };

  const handleEquip = (itemId: string, type: string) => {
    if (!profile) return;
    const updatedProfile = { ...profile };
    
    if (type === 'skin') {
       // item id is skin_gold, we need just the 'gold' part
       const skinName = itemId.split('_')[1];
       updatedProfile.equippedItems = { ...updatedProfile.equippedItems, skin: skinName };
    } else if (type === 'hat') {
       const hatName = itemId.split('_')[1];
       updatedProfile.equippedItems = { ...updatedProfile.equippedItems, hat: hatName };
    }
    
    saveStudentProfile(updatedProfile);
    setProfile(updatedProfile);
  };

  const isUnlocked = (itemId: string) => profile?.unlockedItems?.includes(itemId) || false;
  const isEquipped = (itemId: string) => {
     if (!profile?.equippedItems) return false;
     const name = itemId.split('_')[1];
     return profile.equippedItems.skin === name || profile.equippedItems.hat === name;
  };

  return (
    <main className="min-h-screen bg-[#0a0f1e] p-6 md:p-12 text-white overflow-hidden relative" dir="rtl">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.1),_transparent_70%)] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div>
            <Link href="/diagnose" className="text-slate-400 hover:text-cyan-400 transition mb-6 inline-block font-bold">
              ◀ العودة للمختبرات
            </Link>
            <h1 className="text-5xl md:text-7xl font-black italic">
              متجر <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">بَصيرة</span> 🛒
            </h1>
            <p className="text-slate-400 text-xl font-medium mt-4">استخدم عملاتك الذهبية لتطوير صديقك بصير!</p>
          </div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-slate-900/80 border-2 border-amber-500/50 p-6 rounded-[2rem] flex items-center gap-6 shadow-[0_0_40px_rgba(245,158,11,0.2)]"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-3xl shadow-lg ring-4 ring-amber-500/20">💰</div>
            <div>
              <div className="text-slate-500 text-sm font-black tracking-widest uppercase mb-1">رصيدك الحالي</div>
              <div className="text-4xl font-black text-amber-400">{profile?.coins || 0} عملة</div>
            </div>
          </motion.div>
        </div>

        {/* Feedback Message */}
        <AnimatePresence>
          {purchaseFeedback && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-cyan-500 text-slate-950 p-4 rounded-2xl font-black shadow-2xl mb-8 text-center text-lg border-2 border-white/20"
            >
              {purchaseFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Shop Items */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {SHOP_ITEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden group ${
                  isEquipped(item.id) 
                    ? 'bg-cyan-950/20 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.1)]' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </div>
                  <div className="bg-slate-950 px-4 py-1.5 rounded-full border border-white/10 text-xs font-black tracking-tighter">
                    {item.type === 'skin' ? 'مظهر خارجي' : 'إكسسوار'}
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-2">{item.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">{item.desc}</p>

                <div className="flex items-center justify-between mt-auto">
                    {!isUnlocked(item.id) ? (
                      <button 
                        onClick={() => handleBuy(item)}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-2xl font-black transition shadow-lg active:scale-95"
                      >
                        شراء {item.cost} 💰
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEquip(item.id, item.type)}
                        disabled={isEquipped(item.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition ${
                          isEquipped(item.id) ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                        }`}
                      >
                        {isEquipped(item.id) ? 'تم التجهيز ✅' : 'ارتداء 👕'}
                      </button>
                    )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Robot Preview Side */}
          <div className="lg:col-span-4 rounded-[3rem] bg-slate-900/40 border border-white/5 p-8 flex flex-col items-center sticky top-12 h-fit">
            <h3 className="text-2xl font-black mb-8 text-slate-400 italic">معاينة بصير 🤖</h3>
            
            <div className="w-full h-[400px] bg-slate-950/50 rounded-[2rem] border-2 border-dashed border-slate-800 flex items-center justify-center relative mb-8 overflow-hidden">
               {/* Fixed Robot View for Preview */}
               <div className="scale-125 transform-gpu">
                  <BasirRobot mood="happy" message="أبدو رائعاً!" customEquipped={profile?.equippedItems} />
               </div>
            </div>

            <div className="text-center">
              <p className="text-slate-500 text-sm italic">"التشخيص لا يجب أن يكون مملاً، لنصنع بطلاً فريداً!"</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer padding for fixed robot in normal pages */}
      <div className="h-32" />
    </main>
  );
}
