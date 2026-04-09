# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BASIRA DEVELOPER NOTES & ARCHITECTURE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PROJECT STATUS**: 2026-04-07 Clinical Standardized Audit Complete.

---

## 🏗️ ARCHITECTURAL DECISIONS

### 1. The Clinical Player Engine (`app/components/ui/ClinicalPlayerEngine.tsx`)
- **Pattern**: Higher-Order Component (HOC) utilizing Render-Props for diagnostic isolation.
- **Data Capture**: Exposes `recordInteraction` to child modules, ensuring automated collection of `hesitationDuration`, `timestamp_first_touch`, and `item_difficulty`.
- **IRT (Rasch)**: Implements basic Item Response Theory (IRT) with a linear theta update ($1/trial \times (Actual - Expected)$). This adaptive logic adjusts `difficulty` (1-5) and persists `finalTheta` for clinical reports.
- **Null Safety**: Strict prop-types and domain-driven interfaces (`lib/types.ts`) enforced.

### 2. Norm-Referenced Scoring (`lib/domain/scoring`)
- **Scoring Engine**: Conducts weighted multidimensional analysis (Speed vs. Accuracy) based on the test domain.
- **Norm Tables**: Utilizes `ApproximateNormTable` to convert raw performance into **Standard Scores (SS)** ($M=100, SD=15$) and **Percentile Ranks** using an Abramowitz & Stegun CDF approximation.

### 3. Data Persistence & Supabase Integration
- **Auth**: Next.js App Router Middleware handles session protection.
- **Persistence**: All sessions are saved as `TestSession` objects via `lib/studentProfile.ts`.
- **Reliability**: Errors during Supabase push are caught; results remain available in `localStorage` for manual sync if necessary.

---

## 🛠️ SUPABASE SETUP INSTRUCTIONS

1.  **Project Creation**: Create a new project in Supabase dashboard.
2.  **Environment Variables**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
3.  **Schema Migration**: Run `npx prisma db push` to synchronize our defined models to the PostgreSQL database.
4.  **Identity**: Configure Entra ID / Microsoft Auth for specialist logins.

---

## 📦 EXTERNAL PACKAGES (VETERINARY-CORE)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `framer-motion` | ^11.x | Fluid clinical animations and stimulus presentation. |
| `lucide-react` | ^0.x | Medical-grade iconography. |
| `supabase-js` | Latest | Real-time clinical telemetry storage. |
| `clsx / tailwind-merge` | ^2.x | High-performance CSS utility management. |

---

## 🚀 FUTURE IMPROVEMENTS

- [ ] **Empirical Norms**: Phase out `ApproximateNormTable` once 1,000+ anonymous sessions are collected for real-world benchmarking.
- [ ] **Offline Sync Queue**: Implement IndexedDB for robust offline-to-online data bridging (Rule 5).
- [ ] **Mic Validation**: Real-time phonological analysis via OpenSpeech API integrations.

---

## ⚖️ ETHICS & DISCLAIMER
Basira is designed strictly for **Screening** and **Pre-Diagnostic** assessment. It must never be used for formal medical billing or categorical diagnostic labeling without professional human oversight.
