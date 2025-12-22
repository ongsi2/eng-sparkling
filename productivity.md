# AI 및 Claude Code 생산성 극대화 가이드

> 출처: 오늘도 공부 블로그 (javaexpert.tistory.com)  
> 정리일: 2025-12-22

## 📋 목차

1. [Claude Code 개요](#1-claude-code-개요)
2. [시작하기](#2-시작하기)
3. [핵심 기능](#3-핵심-기능)
4. [CLAUDE.md 작성 가이드](#4-claudemd-작성-가이드)
5. [Hook 시스템](#5-hook-시스템)
6. [실전 템플릿](#6-실전-템플릿)

---

## 1. Claude Code 개요

### 일반 Claude와의 차이점

| 특징 | 설명 |
|-----|------|
| **에이전틱** | 맥락을 더 잘 이해하고 능동적으로 작업 완료 |
| **속도** | 터미널에서 작동하여 지연이 적고 실행 속도 빠름 |
| **파일 접근** | 파일에 직접 접근하고 편집 가능 (가장 큰 차이점) |

### 활용 범위
- ✅ 코딩 및 개발
- ✅ 글쓰기 및 리서치
- ✅ 콘텐츠 제작
- ✅ 프로젝트 관리

---

## 2. 시작하기

### 설치
```bash
npm install -g @anthropic-ai/claude-code
```

**요구사항**: Node.js 18+

### 초기 설정

1. **프로젝트 폴더 생성**
```bash
   mkdir my-project
   cd my-project
```

2. **IDE에서 열기** (VSCode 또는 Cursor)

3. **터미널에서 Claude 실행**
```bash
   claude
```

4. **테스트**
```
   "이 프로젝트에 어떤 파일이 있는지 보여줘"
```

---

## 3. 핵심 기능

### 3.1 claude.md - 영구 기억 시스템

프로젝트의 모든 컨텍스트를 저장하는 핵심 파일

**초기화 방법**:
```bash
/init
```

**포함 내용**:
- 프로젝트 맥락 및 목적
- 작업 스타일과 선호도
- 코딩 표준 및 가이드라인
- 과거 작업 이력

### 3.2 슬래시 커맨드

| 명령어 | 설명 |
|--------|------|
| `/agents` | 활성 서브 에이전트 표시 |
| `/compact` | 대화 기록 정리 (맥락 유지) |
| `/exit` | 세션 종료 |
| `/mcp` | Model Context Protocol 연결 관리 |
| `/memory` | 현재 세션 기억 내용 표시 |

**커스텀 명령어 예시**:
```markdown
# /quick-edit
다음 항목을 중심으로 콘텐츠 개선:
1. 오프닝 강화
2. 프레임워크 명확화
3. 섹션 간 전환 개선
4. 결론 강화
5. 목소리 일관성 유지
```

### 3.3 Plan Mode

**활성화**: `Shift + Tab`

**특징**:
- 실행 전 상세 계획 제시
- 사용자 승인 대기
- 과도한 자동 실행 방지

**사용 시점**:
- 여러 리서치 소스 분석
- 콘텐츠 재정리
- 피드백 처리 및 개선

### 3.4 Sub-Agents

백그라운드에서 특정 작업을 처리하는 전문화된 AI

**특징**:
- 독립적인 컨텍스트 윈도우
- 특정 도구 접근 권한
- 고유한 시스템 프롬프트

**활용 예시**:
```
1. Perplexity MCP로 뉴스 스캔
2. 독자 맞춤 콘텐츠 필터링
3. 성과 데이터 기반 아이디어 제안
4. 자동 문서 생성
```

**생성 방법**: `/agents` 명령어 사용

### 3.5 Output Styles

작업 유형별 응답 방식 사전 정의

**예시**:

**성장 전략가 모드**
- 구체적 성장 지표와 벤치마크
- 타임라인이 포함된 실행 전략
- 경쟁 분석 및 포지셔닝

**소셜 미디어 전략가 모드**
- 콘텐츠 재활용 전략
- 플랫폼별 최적화
- 바이럴 패턴 분석

### 3.6 MCP 통합

외부 서비스 연결

| MCP | 용도 |
|-----|------|
| **Perplexity MCP** | 실시간 웹 검색 및 분석 |
| **Firecrawl MCP** | 웹사이트 콘텐츠 추출 |

### 3.7 GitHub + Obsidian 통합

**모바일 워크플로우**:
1. GitHub 모바일 앱에서 이슈 생성
2. 작업 요청 작성
3. `@claude` 멘션으로 호출
4. 자동 처리 후 결과 업데이트

**Obsidian 활용**:
- 프로젝트 폴더를 Obsidian 볼트로 설정
- 모든 기기에서 동기화
- 음성 메모 자동 통합 (Wisprflow + Apple Shortcuts)

---

## 4. CLAUDE.md 작성 가이드

### 핵심 원칙

> **LLM은 상태가 없다**: 매 세션마다 새롭게 시작

| 사실 | 의미 |
|------|------|
| 매 세션 새 시작 | 중요 정보 매번 제공 필요 |
| 컨텍스트 윈도우가 전부 | 불필요한 정보는 성능 저하 |
| CLAUDE.md는 항상 포함 | 최고 레버리지 포인트 |

### 작성 철학: Less is More

**지시사항 수 제한**:
| 모델 | 안정적 지시사항 수 |
|------|------------------|
| Claude Sonnet | ~150-200개 |
| 소형 모델 | 훨씬 적음 |

⚠️ **중요**: Claude Code 시스템 프롬프트가 이미 ~50개 지시사항 사용 중

### WHAT, WHY, HOW 구조

#### WHAT: 기술 스택과 구조
```markdown
## 기술 스택
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: FastAPI, PostgreSQL, Redis
- 인프라: Docker, AWS ECS

## 프로젝트 구조
├── apps/
│   ├── web/        # 프론트엔드
│   └── api/        # 백엔드
├── packages/
│   ├── ui/         # UI 컴포넌트
│   └── db/         # DB 스키마
└── docs/           # 문서
```

#### WHY: 목적과 역할
```markdown
## 프로젝트 개요
[서비스 목적과 핵심 가치 설명]

## 주요 도메인
- **기능A**: 역할과 책임
- **기능B**: 역할과 책임
- **기능C**: 역할과 책임
```

#### HOW: 작업 방법
```markdown
## 개발 환경
- 패키지 매니저: pnpm
- Node.js: 20.x

## 필수 명령어
pnpm install      # 의존성 설치
pnpm dev          # 개발 서버
pnpm test         # 테스트
pnpm typecheck    # 타입 검사

## 검증 프로세스
1. pnpm typecheck
2. pnpm test
3. pnpm lint
```

### 작성 체크리스트

- [ ] **300줄 이하** (60줄 이하 권장)
- [ ] **보편적 적용 가능** (모든 작업에 관련)
- [ ] **코드 스타일 가이드 제외** (린터 활용)
- [ ] **파일 참조 사용** (코드 스니펫 복사 금지)
- [ ] **점진적 공개 패턴**
- [ ] **직접 작성** (/init 사용 금지)
- [ ] **린터/포매터 별도 설정**

### 점진적 공개 패턴

**문서 구조**:
```
agent_docs/
├── building_the_project.md
├── running_tests.md
├── code_conventions.md
├── service_architecture.md
└── database_schema.md
```

**CLAUDE.md에서 참조**:
```markdown
## 참고 문서

| 파일 | 설명 | 필요 시점 |
|------|------|----------|
| agent_docs/building_the_project.md | 빌드 배포 | 빌드 작업 |
| agent_docs/running_tests.md | 테스트 전략 | 테스트 작성 |
| agent_docs/code_conventions.md | 코드 스타일 | 코드 작성 |

⚠️ 코드 복사 금지, 파일 위치 참조 권장 (예: `src/utils/auth.ts:45`)
```

### 린터 활용

**코드 스타일은 CLAUDE.md에 넣지 말 것!**

**대신 이렇게**:

1. **린터/포매터 설정**
```json
   {
     "formatter": {
       "indentStyle": "space",
       "indentWidth": 2
     },
     "linter": {
       "rules": {"recommended": true}
     }
   }
```

2. **Hook 활용**
```bash
   # .claude/hooks/stop.sh
   #!/bin/bash
   pnpm lint --fix
   pnpm format
```

3. **Slash Command**
```markdown
   # .claude/commands/format.md
   1. `git diff --name-only`로 변경 파일 확인
   2. 각 파일 코드 스타일 검토
   3. 필요시 수정 제안
```

---

## 5. Hook 시스템

### Hook 개요

특정 시점에 발생하는 이벤트에 커스텀 로직 실행

### 주요 Hook 11가지

#### 1. SessionStart
**시점**: 세션 시작  
**용도**: 프로젝트 컨텍스트 로드, 환경 설정
```python
# .claude/hooks/session_start.py
def on_session_start():
    # README 로드
    with open('README.md', 'r') as f:
        context = f.read()
    
    # 브랜치 정보
    import subprocess
    branch = subprocess.check_output(
        ['git', 'branch', '--show-current']
    ).decode().strip()
    
    return {
        'project_context': context,
        'current_branch': branch
    }
```

#### 2. UserPromptSubmit
**시점**: 프롬프트 제출 전  
**용도**: 컨텍스트 추가, 위험 요청 차단
```python
# .claude/hooks/user_prompt_submit.py
def on_user_prompt_submit(prompt):
    # 금지 키워드 체크
    forbidden = ['delete_database', 'production_key']
    if any(k in prompt.lower() for k in forbidden):
        return {'block': True, 'reason': '위험한 작업'}
    
    # 컨텍스트 추가
    enhanced = f"{prompt}\\n[컨텍스트: {get_context()}]"
    return {'enhanced_prompt': enhanced}
```

#### 3. PermissionRequest
**시점**: 권한 요청 시  
**용도**: 파일 접근, API 호출 승인 관리
```python
# .claude/hooks/permission_request.py
def on_permission_request(request):
    # 읽기는 자동 승인
    if request['type'] == 'file_read':
        return {'approve': True}
    
    # 민감한 파일은 거부
    if '.env' in request['path']:
        return {'deny': True}
    
    # 쓰기는 백업 후 승인
    if request['type'] == 'file_write':
        backup_file(request['path'])
        return {'approve': True}
```

#### 4. PreToolUse
**시점**: 도구 실행 전  
**용도**: 위험 명령어 차단, 파라미터 수정
```python
# .claude/hooks/pre_tool_use.py
def on_pre_tool_use(tool_name, parameters):
    # 위험 명령어 차단
    if tool_name == 'bash':
        dangerous = ['rm -rf', 'sudo']
        if any(d in parameters['command'] for d in dangerous):
            return {'block': True}
    
    # 경로 자동 수정
    if tool_name == 'file_write':
        parameters['path'] = f"safe/{parameters['path']}"
        return {'modify': True, 'modified_parameters': parameters}
```

#### 5. PostToolUse
**시점**: 도구 실행 후  
**용도**: 포맷팅, 린트, 테스트 자동 실행
```python
# .claude/hooks/post_tool_use.py
def on_post_tool_use(tool_name, result):
    # 파일 생성 후 포맷팅
    if tool_name == 'create_file':
        subprocess.run(['prettier', '--write', result['path']])
        
        # 린트 체크
        lint = subprocess.run(['eslint', result['path']])
        if lint.returncode != 0:
            return {'warning': '린트 오류 발견'}
    
    # Git 스테이징
    subprocess.run(['git', 'add', result['path']])
    return {'git_staged': True}
```

#### 6. Stop
**시점**: 작업 완료 시  
**용도**: 완료 검증, 추가 작업 강제
```python
# .claude/hooks/stop.py
def on_stop(task_context):
    # 필수 파일 체크
    required = ['main.py', 'test_main.py', 'README.md']
    missing = [f for f in required if not os.path.exists(f)]
    
    if missing:
        return {
            'continue': True,
            'reason': f'누락: {", ".join(missing)}'
        }
    
    # 테스트 실행
    test = subprocess.run(['pytest'], capture_output=True)
    if test.returncode != 0:
        return {'continue': True, 'reason': '테스트 실패'}
    
    # 완료
    return {
        'complete': True,
        'summary': generate_summary(task_context)
    }
```

#### 7. SessionEnd
**시점**: 세션 종료  
**용도**: 리포트 생성, 백업, 통계 저장
```python
# .claude/hooks/session_end.py
def on_session_end(session_data):
    # 통계 생성
    stats = {
        'duration': session_data['duration'],
        'tasks': len(session_data['completed_tasks']),
        'files_created': len(session_data['created_files'])
    }
    
    # 리포트 작성
    report = f"""
# 세션 리포트
- 작업 시간: {stats['duration']}
- 완료 작업: {stats['tasks']}개
- 생성 파일: {stats['files_created']}개
"""
    
    save_report(report)
    
    # Git 커밋
    if session_data.get('auto_commit'):
        subprocess.run(['git', 'add', '.'])
        subprocess.run(['git', 'commit', '-m', 'Claude 세션 완료'])
    
    return {'report_path': get_report_path()}
```

#### 기타 Hook

| Hook | 시점 | 주요 용도 |
|------|------|----------|
| **SubagentStop** | 서브에이전트 작업 완료 | 병렬 작업 검증 |
| **PreCompact** | 컨텍스트 압축 전 | 중요 정보 보존 |
| **Notification** | 알림 발생 | 커스텀 알림 처리 |
| **Error** | 에러 발생 | 에러 처리 및 복구 |

---

## 6. 실전 템플릿

### 6.1 최소 CLAUDE.md 템플릿
```markdown
# 프로젝트명

## 스택
TypeScript, Next.js 14, Prisma, PostgreSQL

## 구조
- src/app: 페이지/라우트
- src/components: UI 컴포넌트
- src/lib: 유틸리티
- prisma: DB 스키마

## 명령어
pnpm dev       # 개발 서버 (localhost:3000)
pnpm test      # 테스트
pnpm build     # 빌드

## 검증
변경 후: `pnpm typecheck && pnpm test`

## 문서
상세: `docs/` 디렉토리
```

### 6.2 Hook 설정 템플릿
```yaml
# .claude/config.yaml
hooks:
  session_start:
    - load_project_context
    - set_environment
  
  user_prompt_submit:
    - enhance_with_context
    - validate_security
  
  pre_tool_use:
    - check_security
    - validate_params
  
  post_tool_use:
    - auto_format
    - run_tests
  
  stop:
    - verify_completion
    - check_quality
  
  session_end:
    - generate_report
    - backup_code

project_context:
  name: "My Project"
  tech_stack:
    - TypeScript
    - Next.js
    - PostgreSQL
  
  standards:
    - Clean Architecture
    - 테스트 커버리지 80%+
    - 린트 오류 0건
```

### 6.3 프로젝트별 커스텀 설정

#### 웹 앱 프로젝트
```markdown
# Web App Project

## 기술 스택
Next.js 14 + TypeScript + Tailwind + Supabase

## 핵심 원칙
- Server Components 우선
- Client Components 최소화
- 타입 안정성 100%
- 접근성 AA 등급

## 명령어
pnpm dev         # localhost:3000
pnpm test        # Vitest
pnpm e2e         # Playwright
pnpm typecheck   # tsc

## 검증
1. typecheck 통과
2. 단위 테스트 통과
3. E2E 테스트 통과
4. Lighthouse 90점+
```

#### 모바일 앱 프로젝트
```markdown
# Mobile App Project

## 기술 스택
Flutter 3.24 + Riverpod + Drift + Web3dart

## 아키텍처
Clean Architecture + Feature-First

## 명령어
flutter run          # 개발 실행
flutter test         # 단위 테스트
flutter analyze      # 정적 분석
dart format .        # 포맷팅

## 검증
1. analyze 오류 0건
2. 테스트 커버리지 80%+
3. 성능 프로파일링 통과
```

#### 데이터 분석 프로젝트
```markdown
# Data Analysis Project

## 기술 스택
Python 3.11 + Pandas + Jupyter + PostgreSQL

## 명령어
python -m venv venv      # 가상환경
source venv/bin/activate # 활성화
pip install -r requirements.txt
jupyter notebook         # 노트북 실행

## 검증
1. 코드 스타일: black + ruff
2. 타입 체크: mypy
3. 테스트: pytest
4. 데이터 검증 통과
```

---

## 7. 생산성 극대화 팁

### 단계별 도입 전략

#### Phase 1: 기본 설정 (1주)
- [ ] Claude Code 설치
- [ ] 프로젝트 폴더 설정
- [ ] `/init`로 claude.md 생성
- [ ] 기본 슬래시 커맨드 익히기

#### Phase 2: 커스터마이징 (2주)
- [ ] 자주 쓰는 커스텀 커맨드 생성
- [ ] Plan Mode 실험
- [ ] claude.md 최적화 (60줄 이하)

#### Phase 3: 자동화 (3-4주)
- [ ] 첫 서브 에이전트 배포
- [ ] Hook 설정 시작 (Stop, PostToolUse)
- [ ] MCP 통합 (Perplexity 등)

#### Phase 4: 고급 활용 (진행형)
- [ ] GitHub 모바일 통합
- [ ] Obsidian 연동
- [ ] 전체 워크플로우 자동화

### 자주 묻는 질문

**Q: CLAUDE.md가 너무 길어졌어요**  
A: 점진적 공개 패턴 사용. 상세 문서는 `agent_docs/`로 분리하고 CLAUDE.md에서는 참조만.

**Q: Claude가 내 지시를 무시해요**  
A: 현재 작업과 무관한 내용은 자동으로 무시됨. 보편적으로 적용 가능한 내용만 작성.

**Q: Hook이 작동하지 않아요**  
A: `.claude/hooks/` 경로 확인 및 실행 권한 부여 (`chmod +x`).

**Q: 어떤 작업을 자동화해야 할까요?**  
A: 반복적인 작업부터 (포맷팅, 린트, 테스트 실행). 점진적으로 확장.

---

## 8. 참고 자료

- [Claude Code 공식 문서](https://docs.anthropic.com/claude/docs/claude-code)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Context Engineering Best Practices](https://docs.anthropic.com/claude/docs/context-engineering)
- [출처 블로그: 오늘도 공부](https://javaexpert.tistory.com/)

---

**마지막 업데이트**: 2025-12-22  
**작성자**: AI 생산성 연구팀  
**라이선스**: 자유롭게 사용 가능 (출처 표기 권장)