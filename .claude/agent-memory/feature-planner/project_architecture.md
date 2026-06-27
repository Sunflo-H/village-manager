---
name: project-architecture
description: "village-manager 프로젝트의 아키텍처 결정사항 및 설계 패턴 요약"
metadata:
  type: project
---

village-manager는 입주자(로그인 없음)와 관리자(Supabase Auth)를 분리한 MVP 웹앱.

**Why:** 입주자 진입 장벽을 최소화하면서 관리자는 보안 로그인으로 데이터를 관리.

**How to apply:** 새 기능 추가 시 입주자 API는 인증 없이, 관리자 API는 `/api/admin/*` 경로에 세션 검증 필수.

## 핵심 설계 결정

### API 패턴
- 입주자 공개 API: `POST /api/inquiries`, `GET /api/inquiries?storeName=<매장명>`
- 관리자 보호 API: `/api/admin/*` (모든 Route Handler에서 Supabase 서버 클라이언트로 세션 검증)
- 인증 실패 시 `401 { error: '인증이 필요합니다' }` 반환

### Supabase 클라이언트 분리
- `lib/supabase/client.ts` — 브라우저 `'use client'` 컴포넌트용 (`createBrowserClient`)
- `lib/supabase/server.ts` — 서버 컴포넌트, Route Handler, Server Action용 (`createServerClient` + cookies)

### 데이터 모델 확정 사항
- `store_name`을 `inquiries` 테이블에 비정규화 저장 — 이력 보존 목적
- 문의 삭제 금지 — status 변경(PENDING→IN_PROGRESS→COMPLETED)으로만 이력 관리
- status 역방향 변경은 MVP에서 허용 (관리자가 자유롭게 변경 가능)
- `updated_at`은 PostgreSQL 트리거로 자동 갱신

### Zustand 스토어 범위
- `inquiryStore` — 입주자 문의 조회 결과 및 매장명 상태
- `adminStore` — 관리자 필터(status, category) 상태
- 서버 데이터는 직접 API 호출, 클라이언트 UI 상태만 Zustand 관리

### 컴포넌트 경로 구조
- `src/components/inquiry/` — 입주자용 (InquiryForm, InquiryCard, 뱃지류)
- `src/components/admin/` — 관리자용 (InquiryTable, InquiryFilter, InquiryDetailForm)
- `src/app/admin/layout.tsx` — 세션 검증 집중 처리, 미인증 시 `/admin/login` 리다이렉트

## 기각된 대안
- Server Action으로 폼 처리: 에러 핸들링 복잡, 재사용성 낮음 → Route Handler 채택
- 입주자에게도 로그인 부여: MVP 원칙 위배 (진입 장벽 최소화)
- `stores` 테이블 없이 문의에 매장명만 저장: 향후 매장별 통계 확장 불가

## 리스크 (높음)
- 입주자가 매장명 오타로 문의 조회 불가 → UI 안내 문구 강조, 향후 자동완성 고려
- anon key 공개로 타 매장 문의 조회 가능성 → API에서 admin_note 제외, RLS 검토
