import { NextResponse, type NextRequest } from 'next/server';
import { createBasiraClient } from './lib/supabase';

/**
 * Middleware to protect routes and manage Supabase sessions.
 */
export async function proxy(request: NextRequest) {
  const supabase = createBasiraClient();
  if (!supabase) return NextResponse.next();

  const { data: { session } } = await supabase.auth.getSession();

  const url = request.nextUrl.clone();
  const isAuthPage = url.pathname === '/login' || url.pathname === '/register';
  const isPublicPage = url.pathname === '/' || url.pathname.startsWith('/api/auth');

  // [OPTIONAL NOW] 1. If trying to access protected route without session -> redirect to login
  // if (!session && !isAuthPage && !isPublicPage) {
  //   url.pathname = '/login';
  //   return NextResponse.redirect(url);
  // }

  // 2. If trying to access login/register while already logged in -> redirect to home/dashboard
  if (session && isAuthPage) {
    url.pathname = '/diagnose'; // Default dashboard for students
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Configure matching paths.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this patterns to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
