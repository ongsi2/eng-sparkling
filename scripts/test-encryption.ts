/**
 * 암호화 테스트 스크립트
 * 실행: npx ts-node scripts/test-encryption.ts
 */

// 직접 구현해서 테스트 (모듈 경로 문제 회피)
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    console.warn('⚠️ ENCRYPTION_KEY not set, using development fallback');
    return crypto.createHash('sha256').update('dev-key-not-for-production').digest();
  }
  return Buffer.from(key, 'hex');
}

function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(encrypted: string): string {
  const parts = encrypted.split(':');
  if (parts.length !== 3) return encrypted;
  const [ivHex, authTagHex, data] = parts;
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  return parts[0].length === IV_LENGTH * 2 && parts[1].length === AUTH_TAG_LENGTH * 2;
}

function hashForSearch(text: string): string {
  const salt = process.env.ENCRYPTION_KEY || 'dev-salt';
  return crypto.createHmac('sha256', salt).update(text.toLowerCase().trim()).digest('hex');
}

console.log('=== 암호화 테스트 ===\n');

// 테스트 IP 주소
const testIP = '192.168.1.100';

console.log('1. 원본 IP:', testIP);

// 암호화
const encrypted = encrypt(testIP);
console.log('2. 암호화됨:', encrypted);
console.log('   - 형식: iv:authTag:data (hex)');
console.log('   - 길이:', encrypted.length, '자');

// 암호화 여부 확인
console.log('3. isEncrypted 체크:', isEncrypted(encrypted));

// 복호화
const decrypted = decrypt(encrypted);
console.log('4. 복호화됨:', decrypted);

// 검증
console.log('5. 원본과 일치:', testIP === decrypted ? '✅ 성공' : '❌ 실패');

// 해시 (검색용)
const hashed = hashForSearch(testIP);
console.log('6. 검색용 해시:', hashed.substring(0, 20) + '...');

console.log('\n=== 환경변수 확인 ===');
console.log('ENCRYPTION_KEY 설정됨:', process.env.ENCRYPTION_KEY ? '✅ Yes' : '⚠️ No (개발용 키 사용)');

console.log('\n=== 테스트 완료 ===');
