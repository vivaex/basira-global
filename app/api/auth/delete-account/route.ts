import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  // 1. Authenticate the caller to get their UID
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Use admin client to verify requester and perform deletion
  // (In production, use supabase.auth.getUser() to confirm the caller's session)
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 403 });
  }

  // 2. Full Data Wipe via ON DELETE CASCADE (Profiles, Sessions, Results)
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Account and associated data deleted (GDPR compliant)' });
}
