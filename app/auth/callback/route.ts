import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logLogin, getClientIPFromRequest, getUserAgentFromRequest } from '@/lib/activity-logger';
import { encryptAndSaveProfile } from '@/lib/profile-encryption';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // Save provider info to profiles
    if (data.user) {
      const provider = data.user.app_metadata?.provider ||
                       data.user.identities?.[0]?.provider ||
                       'unknown';

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabaseAdmin
        .from('profiles')
        .update({ provider })
        .eq('id', data.user.id);

      // Encrypt and save profile data (email, full_name)
      const email = data.user.email || '';
      const fullName = data.user.user_metadata?.full_name ||
                       data.user.user_metadata?.name || '';
      await encryptAndSaveProfile(data.user.id, email, fullName);

      // Log login activity
      await logLogin(request, data.user.id, provider);
    }
  }

  // Get the actual origin from headers (handles reverse proxy)
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const origin = `${protocol}://${host}`;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  // 로그인 성공 후 workflow 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}${basePath}/workflow`);
}
