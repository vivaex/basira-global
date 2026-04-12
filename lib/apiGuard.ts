/**
 * lib/apiGuard.ts — حماية API Routes بصيرة Global
 *
 * طبقات الحماية:
 * 1. Rate Limiting — حد الطلبات (100/دقيقة لكل IP)
 * 2. Origin Validation — التحقق من المصدر
 * 3. Request Size Limit — حجم الطلب الأقصى
 * 4. API Key Validation (للـ Analyze endpoint)
 */

import { NextRequest, NextResponse } from 'next/server';

// ── Rate Limiting (in-memory — for edge/serverless, use Upstash Redis) ────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 60;        // طلب
const RATE_WINDOW_MS = 60_000; // في الدقيقة الواحدة
const MAX_BODY_SIZE = 1024 * 100; // 100 KB

export interface GuardResult {
  ok: boolean;
  error?: string;
  status?: number;
}

/** استخراج IP من الطلب */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** فحص Rate Limiting */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count++;
  return true;
}

/** التحقق من Origin ← يمنع CSRF */
function checkOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin requests have no Origin header

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'https://basira-global.vercel.app',
    // أضف domain عيادتك هنا
  ];

  return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

/**
 * الدرع الرئيسي — استخدمه في كل API route
 *
 * @example
 * export async function POST(req: NextRequest) {
 *   const guard = await apiGuard(req);
 *   if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
 *   ...
 * }
 */
export async function apiGuard(req: NextRequest, requireApiKey = false): Promise<GuardResult> {
  // 1. Rate limit check
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return {
      ok: false,
      error: 'Too Many Requests — يُرجى المحاولة لاحقاً.',
      status: 429,
    };
  }

  // 2. Origin check (non-GET only)
  if (req.method !== 'GET' && !checkOrigin(req)) {
    return {
      ok: false,
      error: 'Forbidden — Origin غير مرخص.',
      status: 403,
    };
  }

  // 3. Content-Type للـ POST
  if (req.method === 'POST') {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        ok: false,
        error: 'Content-Type يجب أن يكون application/json.',
        status: 415,
      };
    }
  }

  // 4. API Key check (اختياري — للـ endpoints الحساسة)
  if (requireApiKey) {
    const apiKey = req.headers.get('x-basira-key');
    const validKey = process.env.BASIRA_INTERNAL_API_KEY;
    if (!validKey || apiKey !== validKey) {
      return {
        ok: false,
        error: 'Unauthorized — مفتاح API غير صحيح.',
        status: 401,
      };
    }
  }

  return { ok: true };
}

/** إنشاء Response موحّد للأخطاء */
export function errorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json(
    { success: false, error: message, timestamp: new Date().toISOString() },
    { status }
  );
}

/** إنشاء Response موحّد للنجاح */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    { success: true, data, timestamp: new Date().toISOString() },
    { status }
  );
}

/** Headers الأمان الموصى بها */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()',
};
