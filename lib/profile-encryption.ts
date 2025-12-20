/**
 * Profile Encryption Utilities
 * email, full_name 암호화/복호화 처리
 *
 * 방식:
 * - email_hash: 검색용 (단방향 해시)
 * - email_encrypted: 표시용 (양방향 암호화)
 * - full_name_encrypted: 표시용 (양방향 암호화)
 */

import { encrypt, decrypt, hashForSearch } from './encryption';
import { supabaseAdmin } from './supabase-server';

export interface EncryptedProfile {
  id: string;
  email: string | null;
  email_hash: string | null;
  email_encrypted: string | null;
  full_name: string | null;
  full_name_encrypted: string | null;
  avatar_url: string | null;
  coins: number;
  is_admin: boolean;
}

export interface DecryptedProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  coins: number;
  is_admin: boolean;
}

/**
 * 프로필 암호화하여 저장
 */
export async function encryptAndSaveProfile(
  userId: string,
  email: string,
  fullName: string
): Promise<boolean> {
  try {
    const emailHash = hashForSearch(email);
    const emailEncrypted = encrypt(email);
    const fullNameEncrypted = fullName ? encrypt(fullName) : null;

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        email_hash: emailHash,
        email_encrypted: emailEncrypted,
        full_name_encrypted: fullNameEncrypted,
      })
      .eq('id', userId);

    if (error) {
      console.error('Failed to encrypt profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Profile encryption error:', error);
    return false;
  }
}

/**
 * 암호화된 프로필 복호화
 */
export function decryptProfile(profile: EncryptedProfile): DecryptedProfile {
  return {
    id: profile.id,
    email: profile.email_encrypted
      ? decrypt(profile.email_encrypted)
      : profile.email || '',
    full_name: profile.full_name_encrypted
      ? decrypt(profile.full_name_encrypted)
      : profile.full_name || '',
    avatar_url: profile.avatar_url,
    coins: profile.coins,
    is_admin: profile.is_admin,
  };
}

/**
 * 이메일 해시로 사용자 검색
 */
export async function findProfileByEmailHash(email: string): Promise<EncryptedProfile | null> {
  const emailHash = hashForSearch(email);

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email_hash', emailHash)
    .single();

  if (error || !data) {
    return null;
  }

  return data as EncryptedProfile;
}

/**
 * 기존 프로필 일괄 암호화 (마이그레이션용)
 */
export async function migrateExistingProfiles(): Promise<{ success: number; failed: number }> {
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name')
    .is('email_encrypted', null);  // 아직 암호화 안 된 것만

  if (error || !profiles) {
    console.error('Failed to fetch profiles:', error);
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (const profile of profiles) {
    if (profile.email) {
      const result = await encryptAndSaveProfile(
        profile.id,
        profile.email,
        profile.full_name || ''
      );
      if (result) {
        success++;
      } else {
        failed++;
      }
    }
  }

  return { success, failed };
}
