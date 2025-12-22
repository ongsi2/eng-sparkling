# 보안 점검

프로젝트의 보안 상태를 점검합니다:

1. **XSS 취약점**: 사용자 입력이 `sanitizeHtml()` 없이 렌더링되는 곳 검색
2. **CSRF 보호**: POST/PUT/DELETE API가 `apiClient` 또는 CSRF 토큰을 사용하는지 확인
3. **SQL Injection**: Supabase 쿼리에서 raw SQL 사용 여부 확인
4. **민감정보 노출**: .env 파일의 키가 클라이언트에 노출되지 않는지 확인
5. **암호화**: 개인정보가 `encrypt()` 함수로 암호화되는지 확인

발견된 취약점을 심각도와 함께 리포트하세요.
