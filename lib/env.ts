/**
 * 환경변수 검증
 * 서버 시작 시 필수 환경변수가 설정되었는지 확인
 */

interface EnvConfig {
  name: string;
  required: boolean;
  isPublic?: boolean; // NEXT_PUBLIC_ 접두사 여부
}

const ENV_CONFIGS: EnvConfig[] = [
  // Supabase
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, isPublic: true },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, isPublic: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true },

  // OpenAI
  { name: 'OPENAI_API_KEY', required: true },
  { name: 'OPENAI_MODEL', required: false },

  // Toss Payments
  { name: 'NEXT_PUBLIC_TOSS_CLIENT_KEY', required: true, isPublic: true },
  { name: 'TOSS_SECRET_KEY', required: true },

  // App Config
  { name: 'NEXT_PUBLIC_BASE_PATH', required: false, isPublic: true },
];

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * 환경변수 검증 실행
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const config of ENV_CONFIGS) {
    const value = process.env[config.name];

    if (config.required && !value) {
      missing.push(config.name);
    }

    // placeholder 값 체크
    if (value && isPlaceholder(value)) {
      if (config.required) {
        missing.push(`${config.name} (placeholder value detected)`);
      } else {
        warnings.push(`${config.name} has placeholder value`);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Placeholder 값인지 확인
 */
function isPlaceholder(value: string): boolean {
  const placeholders = [
    'placeholder',
    'your-',
    'xxx',
    'test_key',
    'sk-xxx',
    'pk-xxx',
  ];

  const lowerValue = value.toLowerCase();
  return placeholders.some(p => lowerValue.includes(p));
}

/**
 * 서버 시작 시 환경변수 검증
 * 필수 환경변수가 없으면 에러 로그 출력
 */
export function checkEnvOnStartup(): void {
  const result = validateEnv();

  if (!result.valid) {
    console.error('\n========================================');
    console.error('  환경변수 설정 오류');
    console.error('========================================');
    console.error('\n필수 환경변수가 설정되지 않았습니다:\n');
    result.missing.forEach(name => {
      console.error(`  - ${name}`);
    });
    console.error('\n.env.local 파일을 확인해주세요.');
    console.error('========================================\n');

    // 프로덕션에서는 서버 시작 실패
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${result.missing.join(', ')}`);
    }
  }

  if (result.warnings.length > 0) {
    console.warn('\n========================================');
    console.warn('  환경변수 경고');
    console.warn('========================================');
    result.warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
    console.warn('========================================\n');
  }
}

/**
 * 특정 환경변수 가져오기 (타입 안전)
 */
export function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value || defaultValue!;
}

/**
 * 환경변수 요약 출력 (민감 정보 마스킹)
 */
export function printEnvSummary(): void {
  console.log('\n========================================');
  console.log('  환경변수 설정 상태');
  console.log('========================================');

  for (const config of ENV_CONFIGS) {
    const value = process.env[config.name];
    const status = value ? '✓' : '✗';
    const masked = value ? maskValue(value) : 'NOT SET';
    const requiredTag = config.required ? '[필수]' : '[선택]';

    console.log(`  ${status} ${config.name} ${requiredTag}`);
    console.log(`      ${masked}`);
  }

  console.log('========================================\n');
}

/**
 * 값 마스킹 (앞 8자리만 표시)
 */
function maskValue(value: string): string {
  if (value.length <= 8) {
    return '****';
  }
  return value.substring(0, 8) + '****';
}
