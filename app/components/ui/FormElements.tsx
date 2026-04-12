'use client';

import React from 'react';
import { YesNoSometimes } from '@/lib/studentProfile';

// --- Stable Styles ---
const inputBaseStyles = "w-full bg-slate-900/80 border border-slate-700/50 text-white px-5 py-4 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all font-medium text-lg";

// --- Components ---

/**
 * StableFieldInput
 */
export const StableFieldInput = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '',
  id,
  className = ""
}: { 
  label?: string; 
  value: any; 
  onChange: (v: string) => void; 
  type?: string; 
  placeholder?: string;
  id?: string;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && <label className="text-slate-300 font-bold mb-2 text-lg px-1" htmlFor={id}>{label}</label>}
      <input 
        id={id}
        type={type} 
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputBaseStyles}
        autoComplete="off"
      />
    </div>
  );
};

/**
 * StableYesNoToggle
 */
export const StableYesNoToggle = ({ 
  label, 
  value, 
  onChange,
  className = "",
  t
}: { 
  label: string; 
  value: any; 
  onChange: (v: any) => void;
  className?: string;
  t?: any;
}) => {
  // Supports boolean or YesNoSometimes string
  const isSelected = (v: any) => value === v;
  
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between bg-slate-800/40 p-5 rounded-[2rem] border border-white/5 shadow-lg ${className}`}>
      <span className="text-slate-200 font-black mb-4 md:mb-0 text-lg leading-snug">{label}</span>
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 overflow-hidden">
        <button 
          type="button"
          onClick={() => onChange(true)}
          className={`px-8 py-3 rounded-xl font-black transition-all ${isSelected(true) || isSelected('yes') ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:text-white'}`}
        >
          {t ? t('yes') : 'نعم'}
        </button>
        {onChange.length === 1 && typeof value === 'string' && (
          <button 
            type="button"
            onClick={() => onChange('sometimes')}
            className={`px-8 py-3 rounded-xl font-black transition-all ${isSelected('sometimes') ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'text-slate-500 hover:text-white'}`}
          >
            {t ? t('sometimes') : 'أحياناً'}
          </button>
        )}
        <button 
          type="button"
          onClick={() => onChange(false)}
          className={`px-8 py-3 rounded-xl font-black transition-all ${isSelected(false) || isSelected('no') ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'text-slate-500 hover:text-white'}`}
        >
          {t ? t('no') : 'لا'}
        </button>
      </div>
    </div>
  );
};

/**
 * StableTriChoice
 */
export const StableTriChoice = ({ 
  label, 
  value, 
  onChange,
  t
}: { 
  label: string; 
  value: YesNoSometimes | undefined | string; 
  onChange: (v: YesNoSometimes) => void;
  t: any;
}) => {
  const opts = [
    { v: 'yes',       label: t('yes'),    color: 'emerald' },
    { v: 'sometimes', label: t('sometimes'), color: 'amber' },
    { v: 'no',        label: t('no'),     color: 'rose' },
  ];
  return (
    <div className="mb-5">
      <p className="text-slate-300 font-bold mb-4 text-lg">{label}</p>
      <div className="flex gap-3">
        {opts.map(o => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v as YesNoSometimes)}
            className={`flex-1 py-4 rounded-2xl text-lg font-black transition-all border-2 ${
              value === o.v
                ? o.color === 'emerald' ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : o.color === 'amber'   ? 'bg-amber-500 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-rose-500 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                : 'bg-slate-900/50 border-white/5 text-slate-500 hover:border-white/10'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
};
