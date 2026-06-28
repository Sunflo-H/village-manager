# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

빌라/상가 입주자(매장)가 시설 보수 문의를 등록하고, 관리자가 상태를 추적·관리하는 MVP 웹앱.

- 입주자는 **로그인 없이** 매장명만으로 문의를 등록하고 조회할 수 있음
- 관리자는 별도 로그인 후 모든 문의를 관리
- 데이터는 삭제하지 않고 status 변경으로만 이력 보존

## 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트
npm run lint
```

## 기술 스택

- **프레임워크**: Next.js 15 (App Router) + TypeScript
- **스타일**: Tailwind CSS + shadcn/ui
- **폼/유효성 검사**: React Hook Form + Zod
- **백엔드**: Supabase (PostgreSQL + Auth)
- **배포**: Vercel

## 아키텍처

### 디렉토리 구조

```
src/
  app/                        # Next.js App Router 페이지
    page.tsx                  # 홈
    inquiry/
      new/page.tsx            # 문의 등록
      check/page.tsx          # 내 문의 조회 (매장명 입력)
    admin/
      page.tsx                # 관리자 대시보드
      login/page.tsx          # 관리자 로그인
      inquiry/[id]/page.tsx   # 문의 상세
  components/                 # 재사용 컴포넌트
  lib/
    supabase/                 # Supabase 클라이언트 (client/server 분리)
    validations/              # Zod 스키마
  types/                      # TypeScript 타입 정의
```

### 데이터 모델 (Supabase)

```sql
stores: id, name(UNIQUE), created_at
inquiries: id, store_id(FK), store_name, content, category, status, admin_note, created_at, updated_at
```

- `status` 값: `PENDING` | `IN_PROGRESS` | `COMPLETED`
- `category` 값: 전기, 배관, 에어컨, 시설, 기타

### Supabase 클라이언트 패턴

- `lib/supabase/client.ts` — 브라우저(클라이언트 컴포넌트)용
- `lib/supabase/server.ts` — 서버 컴포넌트 / Server Action용
- 관리자 인증은 Supabase Auth 사용, 입주자는 인증 없음

### 핵심 설계 원칙

1. 입주자 인증 없음 — 매장명 자유 입력으로 구분
2. 문의 삭제 금지 — status 변경으로만 상태 관리
3. 관리자 전용 기능은 `/admin` 경로 하위에 집중

### 추가 규칙

1. 코드 추가, 수정 등 코드를 건드리는 작업을 한 뒤에 바로 커밋,푸쉬 하기 전에 코드 테스트와 리뷰 작업을 거친다. 이에 상응하는 코드 테스트, 리뷰 에이전트가 있다면 그 에이전트를 사용한다.