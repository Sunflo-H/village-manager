# 매장 문의 관리 시스템 MVP 기획 문서

> 작성일: 2026-06-26
> 상태: 초안

---

## 확인이 필요한 사항

- [ ] 관리자 계정은 몇 명이 사용하는가? (단일 계정 vs 복수 계정에 따라 Auth 전략이 달라짐)
- [ ] 관리자 대시보드에서 문의 목록을 한 번에 몇 건씩 보여줄 것인가? (페이지네이션 단위)
- [ ] 입주자가 매장명을 다르게 입력하면 문의 조회가 불가능한데, 오타 가이드 UI가 필요한가?
- [ ] 문의 등록 후 입주자에게 별도 확인 수단(카카오, 문자 등)을 연동할 계획이 있는가?
- [ ] 관리자 메모는 입주자에게 공개되어야 하는가, 아니면 내부 전용인가?

---

## 1. 목표 및 배경

### 왜 이 시스템이 필요한가

빌라/상가 건물 관리자는 입주 매장으로부터 전화·메모지 등 비체계적인 방식으로 시설 보수 요청을 받는다. 이로 인해 요청 누락, 처리 현황 파악 불가, 이력 관리 불가 문제가 반복된다. 입주자 입장에서도 문의 후 처리 상태를 확인할 방법이 없다.

이 시스템은 다음 두 가지를 해결한다:

1. 입주자 — 로그인 없이 언제든지 문의 등록 및 처리 상태 조회 가능
2. 관리자 — 전체 문의를 한 곳에서 파악하고 상태를 체계적으로 관리 가능

### 성공 기준

| 지표 | 목표 |
|------|------|
| 입주자가 문의 등록에 걸리는 시간 | 3분 이내 |
| 관리자가 전체 미처리 문의를 파악하는 시간 | 1분 이내 |
| 문의 처리 현황 추적 가능 여부 | 100% (모든 문의에 status 부여) |
| 문의 누락 건수 | 0 (등록된 모든 문의가 영구 보존) |

---

## 2. 요구사항

### 필수 (Must Have)

**입주자 기능**
- 매장명 입력만으로 문의 등록 (회원가입/로그인 없음)
- 카테고리(전기·배관·에어컨·시설·기타) 선택 후 문의 내용 작성
- 매장명 입력으로 자신의 문의 목록 및 상태 조회

**관리자 기능**
- Supabase Auth 기반 이메일/비밀번호 로그인
- 전체 문의 목록 조회 (최신순 기본 정렬)
- status 필터링 (PENDING / IN_PROGRESS / COMPLETED)
- 카테고리 필터링
- 문의 상태 변경 (PENDING → IN_PROGRESS → COMPLETED)
- 관리자 메모 작성 및 수정

**공통**
- 반응형 UI (모바일 우선)
- 문의 데이터 삭제 금지 — status 변경으로만 상태 이력 보존

### 선택 (Nice to Have)

- 관리자 대시보드 통계 카드 (카테고리별·상태별 건수)
- 문의 등록 후 등록 번호(id 앞 8자리) 표시 — 추후 문의 조회 시 참조 가능
- 문의 목록 날짜 범위 필터

### 제외 범위 (Out of Scope)

- 입주자 회원가입 및 로그인
- 파일/이미지 첨부
- 관리자 계정 생성 UI (Supabase 콘솔에서 직접 등록)
- 알림 기능 (이메일, 문자, 푸시)
- 문의 삭제 기능
- 관리자 외 사용자의 status 변경

---

## 3. 사용자 흐름

### [입주자] 문의 등록 시나리오

1. 입주자가 `/` (홈)에 접속한다.
2. "문의 등록" 버튼을 클릭하여 `/inquiry/new`로 이동한다.
3. 매장명, 카테고리, 문의 내용을 입력한 후 "등록" 버튼을 클릭한다.
4. 클라이언트에서 Zod 유효성 검사를 수행한다.
   - 실패 시: 필드 아래에 인라인 에러 메시지 표시 (예: "매장명을 입력해 주세요")
5. `POST /api/inquiries`가 호출된다.
   - 시스템이 `stores` 테이블에서 해당 매장명을 조회한다.
   - 존재하지 않으면 `stores` 테이블에 신규 매장을 생성한다.
   - `inquiries` 테이블에 status `PENDING`으로 문의를 저장한다.
6. 등록 성공 시 성공 메시지와 함께 등록된 문의 id(앞 8자리)를 화면에 표시한다.
7. "내 문의 조회" 버튼으로 `/inquiry/check`로 이동하거나, "홈으로" 버튼으로 `/`로 이동한다.

### [입주자] 문의 조회 시나리오

1. 입주자가 `/inquiry/check`에 접속한다.
2. 매장명을 입력하고 "조회" 버튼을 클릭한다.
3. `GET /api/inquiries?storeName=<매장명>`이 호출된다.
4. 해당 매장의 문의 목록이 카드 형태로 최신순으로 표시된다.
   - 각 카드: 카테고리, 문의 내용 요약(50자), status 뱃지, 등록일
   - 매장명이 없는 경우(조회 결과 0건): "등록된 문의가 없습니다" 안내 메시지 표시
5. 카드를 클릭하면 해당 문의 상세 내용을 모달 또는 인라인으로 확장하여 표시한다.
   - 표시 항목: 카테고리, 전체 문의 내용, status, 관리자 메모(공개 여부 확인 필요)

### [관리자] 로그인 시나리오

1. 관리자가 `/admin/login`에 접속한다.
2. 이메일과 비밀번호를 입력 후 "로그인" 버튼을 클릭한다.
3. Supabase Auth `signInWithPassword`를 호출한다.
   - 실패 시: "이메일 또는 비밀번호가 올바르지 않습니다" 에러 메시지 표시
4. 성공 시 Supabase 세션 쿠키가 설정되고 `/admin`으로 리다이렉트된다.
5. `/admin` 페이지의 서버 컴포넌트가 Supabase 세션을 검증한다.
   - 세션 없음: `/admin/login`으로 리다이렉트

### [관리자] 대시보드 문의 목록 조회 시나리오

1. 관리자가 `/admin`에 접속한다.
2. 서버에서 `GET /api/admin/inquiries` (또는 Server Component 직접 쿼리)로 전체 문의 목록을 조회한다.
3. 상단에 필터 영역(status, 카테고리)과 문의 목록 테이블이 표시된다.
4. 필터를 변경하면 쿼리 파라미터를 업데이트하고 목록을 다시 조회한다.
5. 문의 행을 클릭하면 `/admin/inquiry/[id]`로 이동한다.

### [관리자] 문의 상세 처리 시나리오

1. 관리자가 `/admin/inquiry/[id]`에 접속한다.
2. 서버에서 해당 문의 상세 정보를 조회하여 표시한다.
3. status 셀렉트 박스에서 상태를 변경하고 "저장" 버튼을 클릭한다.
4. `PATCH /api/admin/inquiries/[id]`가 호출되어 status와 admin_note를 저장한다.
5. 성공 시 "저장되었습니다" 토스트 메시지를 표시하고 화면을 최신 데이터로 갱신한다.

---

## 4. 설계 결정사항

### 데이터 모델

```typescript
// types/store.ts

/** stores 테이블 */
interface Store {
  id: string;           // uuid
  name: string;         // 매장명 (UNIQUE)
  created_at: string;   // timestamptz (ISO 8601)
}

// types/inquiry.ts

/** 문의 상태 */
type InquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

/** 문의 카테고리 */
type InquiryCategory = '전기' | '배관' | '에어컨' | '시설' | '기타';

/** inquiries 테이블 */
interface Inquiry {
  id: string;                    // uuid
  store_id: string;              // uuid, FK → stores.id
  store_name: string;            // 비정규화 — 매장명 변경 이력 보존용
  content: string;               // 문의 내용
  category: InquiryCategory;
  status: InquiryStatus;
  admin_note: string | null;     // 관리자 메모
  created_at: string;            // timestamptz
  updated_at: string;            // timestamptz
}

/** 입주자 문의 조회용 — 관리자 전용 필드 제외 */
type InquirySummary = Pick<
  Inquiry,
  'id' | 'store_name' | 'content' | 'category' | 'status' | 'created_at'
>;

// API 요청/응답 타입

/** POST /api/inquiries 요청 */
interface CreateInquiryRequest {
  storeName: string;             // 1~50자
  content: string;               // 1~500자
  category: InquiryCategory;
}

/** POST /api/inquiries 응답 */
interface CreateInquiryResponse {
  id: string;
  shortId: string;               // id 앞 8자리 (사용자에게 표시)
}

/** GET /api/inquiries 응답 */
interface GetInquiriesResponse {
  inquiries: InquirySummary[];
}

/** PATCH /api/admin/inquiries/[id] 요청 */
interface UpdateInquiryRequest {
  status?: InquiryStatus;
  admin_note?: string;
}

/** PATCH /api/admin/inquiries/[id] 응답 */
interface UpdateInquiryResponse {
  inquiry: Inquiry;
}

/** 공통 에러 응답 */
interface ApiErrorResponse {
  error: string;
}
```

### Zod 스키마

```typescript
// lib/validations/inquiry.ts

import { z } from 'zod';

export const INQUIRY_CATEGORIES = ['전기', '배관', '에어컨', '시설', '기타'] as const;
export const INQUIRY_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;

/** 문의 등록 폼 스키마 */
export const createInquirySchema = z.object({
  storeName: z.string().min(1, '매장명을 입력해 주세요').max(50, '매장명은 50자 이내로 입력해 주세요'),
  content: z.string().min(1, '문의 내용을 입력해 주세요').max(500, '문의 내용은 500자 이내로 입력해 주세요'),
  category: z.enum(INQUIRY_CATEGORIES, { errorMap: () => ({ message: '카테고리를 선택해 주세요' }) }),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;

/** 매장명 조회 폼 스키마 */
export const checkInquirySchema = z.object({
  storeName: z.string().min(1, '매장명을 입력해 주세요'),
});

export type CheckInquiryInput = z.infer<typeof checkInquirySchema>;

/** 관리자 문의 수정 스키마 */
export const updateInquirySchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  admin_note: z.string().max(1000, '관리자 메모는 1000자 이내로 입력해 주세요').optional(),
});

export type UpdateInquiryInput = z.infer<typeof updateInquirySchema>;

/** 관리자 로그인 스키마 */
export const adminLoginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해 주세요'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
```

### API 설계

모든 API는 Next.js App Router의 Route Handler(`app/api/`)로 구현한다.

#### 입주자 API

| Method | Endpoint | Request Body | Response (200) | 에러 응답 |
|--------|----------|--------------|----------------|-----------|
| POST | `/api/inquiries` | `{ storeName, content, category }` | `{ id, shortId }` | 400: 유효성 검사 실패 / 500: 서버 오류 |
| GET | `/api/inquiries?storeName=<매장명>` | — | `{ inquiries: InquirySummary[] }` | 400: storeName 누락 / 500: 서버 오류 |

**POST /api/inquiries 상세 처리 순서**

1. 요청 바디를 `createInquirySchema`로 검증
2. `stores` 테이블에서 `name = storeName` 조회
3. 없으면 `stores` INSERT, 있으면 기존 `id` 사용
4. `inquiries` INSERT (status: `PENDING`)
5. `{ id, shortId: id.slice(0, 8) }` 반환

**GET /api/inquiries 상세 처리 순서**

1. 쿼리 파라미터 `storeName` 추출 및 빈값 검증
2. `inquiries` 테이블에서 `store_name = storeName` 조건으로 조회 (created_at DESC)
3. `InquirySummary[]` 반환 (admin_note 제외)

#### 관리자 API (인증 필수)

| Method | Endpoint | Request Body | Response (200) | 에러 응답 |
|--------|----------|--------------|----------------|-----------|
| GET | `/api/admin/inquiries` | — | `{ inquiries: Inquiry[] }` | 401: 미인증 / 500: 서버 오류 |
| GET | `/api/admin/inquiries/[id]` | — | `{ inquiry: Inquiry }` | 401: 미인증 / 404: 없음 / 500: 서버 오류 |
| PATCH | `/api/admin/inquiries/[id]` | `{ status?, admin_note? }` | `{ inquiry: Inquiry }` | 400: 유효성 실패 / 401: 미인증 / 404: 없음 / 500: 서버 오류 |
| POST | `/api/admin/auth/login` | `{ email, password }` | `{ redirectTo: '/admin' }` | 400: 유효성 실패 / 401: 인증 실패 |
| POST | `/api/admin/auth/logout` | — | `{ success: true }` | 500: 서버 오류 |

**GET /api/admin/inquiries 쿼리 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| status | `InquiryStatus` (optional) | 상태 필터 |
| category | `InquiryCategory` (optional) | 카테고리 필터 |
| page | `number` (optional, 기본값: 1) | 페이지 번호 |
| limit | `number` (optional, 기본값: 20) | 페이지당 건수 |

**관리자 API 인증 처리**

모든 `/api/admin/*` 라우트 핸들러는 Supabase `server` 클라이언트로 세션을 검증하고, 세션이 없으면 `401 { error: '인증이 필요합니다' }`를 반환한다.

### Supabase 클라이언트 분리 전략

```typescript
// lib/supabase/client.ts
// 용도: 클라이언트 컴포넌트에서 사용 (브라우저 환경)
// 주의: 민감한 작업(관리자 인증 확인 등)에 사용 금지

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts
// 용도: 서버 컴포넌트, Route Handler, Server Action에서 사용
// 쿠키를 통해 세션을 읽고 갱신

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

**클라이언트 선택 기준**

| 환경 | 사용 클라이언트 |
|------|----------------|
| `'use client'` 컴포넌트 | `lib/supabase/client.ts` |
| Server Component | `lib/supabase/server.ts` |
| Route Handler (`app/api/`) | `lib/supabase/server.ts` |
| Server Action | `lib/supabase/server.ts` |

입주자 관련 API는 Supabase anon key를 사용하므로 별도 인증 없이 데이터에 접근한다. 관리자 API는 서버 클라이언트로 세션을 검증한다. RLS(Row Level Security) 정책은 MVP 단계에서 단순하게 유지한다.

### 컴포넌트 구조

```
src/
  app/
    page.tsx                          # 홈 — 진입점 선택 (입주자/관리자)
    inquiry/
      new/
        page.tsx                      # 문의 등록 페이지
      check/
        page.tsx                      # 내 문의 조회 페이지
    admin/
      layout.tsx                      # 관리자 레이아웃 (세션 검증 + 네비게이션)
      page.tsx                        # 관리자 대시보드
      login/
        page.tsx                      # 관리자 로그인 페이지
      inquiry/
        [id]/
          page.tsx                    # 문의 상세 페이지
    api/
      inquiries/
        route.ts                      # GET, POST /api/inquiries
      admin/
        inquiries/
          route.ts                    # GET /api/admin/inquiries
          [id]/
            route.ts                  # GET, PATCH /api/admin/inquiries/[id]
        auth/
          login/
            route.ts                  # POST /api/admin/auth/login
          logout/
            route.ts                  # POST /api/admin/auth/logout

  components/
    inquiry/
      InquiryForm.tsx                 # 문의 등록 폼 (React Hook Form + Zod)
      InquiryCard.tsx                 # 문의 카드 (입주자 조회용)
      InquiryStatusBadge.tsx          # status 뱃지 컴포넌트
      InquiryCategoryBadge.tsx        # 카테고리 뱃지 컴포넌트
    admin/
      InquiryTable.tsx                # 관리자 문의 목록 테이블
      InquiryFilter.tsx               # status/카테고리 필터 영역
      InquiryDetailForm.tsx           # 문의 상세 편집 폼 (status + admin_note)
    ui/                               # shadcn/ui 컴포넌트 (자동 생성)

  lib/
    supabase/
      client.ts                       # 브라우저 클라이언트
      server.ts                       # 서버 클라이언트
    validations/
      inquiry.ts                      # Zod 스키마 및 타입

  types/
    inquiry.ts                        # Inquiry, InquiryStatus, InquiryCategory 타입
    store.ts                          # Store 타입

  store/
    inquiryStore.ts                   # Zustand — 입주자 조회 상태 관리
    adminStore.ts                     # Zustand — 관리자 필터 상태 관리
```

### Zustand 스토어 설계

```typescript
// store/inquiryStore.ts
// 용도: 입주자 문의 조회 결과 및 입력 상태 관리

interface InquiryStore {
  storeName: string;                  // 조회에 사용한 매장명
  inquiries: InquirySummary[];
  isLoading: boolean;
  error: string | null;
  setStoreName: (name: string) => void;
  fetchInquiries: (storeName: string) => Promise<void>;
  reset: () => void;
}

// store/adminStore.ts
// 용도: 관리자 필터 상태 관리

interface AdminStore {
  statusFilter: InquiryStatus | 'ALL';
  categoryFilter: InquiryCategory | 'ALL';
  setStatusFilter: (status: InquiryStatus | 'ALL') => void;
  setCategoryFilter: (category: InquiryCategory | 'ALL') => void;
  resetFilters: () => void;
}
```

### 설계 이유

| 결정 | 이유 |
|------|------|
| `store_name`을 `inquiries` 테이블에 비정규화하여 저장 | 매장명이 변경되더라도 문의 등록 당시 매장명이 이력으로 보존됨 |
| 관리자 API를 별도 Route Handler로 분리 (`/api/admin/*`) | 인증 미들웨어 적용 범위를 명확히 하고, 입주자 API와 혼재 방지 |
| Supabase client/server 분리 | Next.js SSR 환경에서 쿠키 기반 세션을 올바르게 처리하기 위함 |
| 문의 조회에 GET 쿼리 파라미터 사용 | 브라우저 북마크 및 URL 공유 가능, 뒤로가기 시 조회 상태 유지 |
| Zustand를 필터/조회 상태에만 사용 | 서버 데이터는 Route Handler에서 직접 조회하고, 클라이언트 UI 상태만 전역 관리 |

---

## 5. 엣지 케이스 및 예외 처리

| 상황 | 처리 방법 |
|------|----------|
| 매장명 대소문자/공백 차이로 중복 등록 | MVP에서는 exact match만 처리. `storeName.trim()`으로 앞뒤 공백 제거 후 저장 |
| 동일 매장이 동일 카테고리로 문의 중복 등록 | 허용 — 별도 중복 검사 없음 (입주자가 여러 건 등록 가능) |
| 매장명 조회 결과 0건 | "등록된 문의가 없습니다" + "문의 등록하기" 버튼 표시 |
| 문의 내용 500자 초과 입력 | 폼 유효성 검사에서 즉시 차단, 현재 글자 수 표시 (예: 423/500) |
| 관리자 세션 만료 중 요청 | API에서 401 반환 → 클라이언트에서 `/admin/login`으로 리다이렉트 |
| 존재하지 않는 문의 id 접근 | `/api/admin/inquiries/[id]`에서 404 반환, 페이지에서 "존재하지 않는 문의입니다" 표시 |
| 네트워크 오류 (API 요청 실패) | try-catch로 에러 캐치 → "일시적인 오류가 발생했습니다. 다시 시도해 주세요" + 재시도 버튼 |
| Supabase DB 오류 | Route Handler에서 500 반환, 서버 로그에 에러 기록 |
| status 역방향 변경 (COMPLETED → PENDING) | MVP에서는 허용 — 관리자가 자유롭게 변경 가능 |
| 관리자 로그인 연속 실패 | Supabase Auth 기본 제한 정책에 위임 (별도 rate limit 구현 없음) |
| `admin_note`가 없는 상태에서 상세 조회 | `null`로 반환, UI에서 빈 텍스트 영역으로 표시 |

---

## 6. 트레이드오프 및 대안

| 대안 | 장점 | 단점 | 선택하지 않은 이유 |
|------|------|------|------------------|
| 입주자에게도 로그인 부여 | 매장명 오타 문제 해결, 개인화 가능 | 진입 장벽 상승, 구현 복잡도 증가 | MVP 핵심 원칙 위배 — 입주자 마찰 최소화 |
| Server Action으로 폼 제출 처리 | Route Handler 없이 간결한 구조 | 에러 핸들링 패턴이 복잡, 재사용성 낮음 | Route Handler가 테스트 용이성 및 명확한 API 계약 제공 |
| `stores` 테이블 없이 `inquiries`에 매장명만 저장 | 테이블 수 감소 | 매장별 통계/조회가 어려워짐 | 향후 매장별 대시보드 확장 가능성 고려 |
| 관리자 대시보드를 Server Component로 전체 구현 | 클라이언트 JS 감소 | 필터 변경마다 전체 페이지 리로드 필요 | 필터 UX 저하 — 클라이언트 상태(Zustand)로 필터 관리 후 API 호출 방식 채택 |
| `status` 변경에 PATCH 대신 PUT 사용 | 의미 명확 (전체 교체) | 전체 필드 전송 필요 | 부분 업데이트(status만 또는 admin_note만)가 자주 발생하므로 PATCH가 적합 |
| next/navigation의 redirect로 관리자 인증 처리 | 미들웨어 없이 단순 구현 | 각 Server Component마다 반복 코드 발생 | `admin/layout.tsx`에 세션 검증을 집중시켜 중복 제거 |

---

## 7. 작업 분해 (Task Breakdown)

### Phase 1: 기반 작업

- [ ] **Supabase 프로젝트 생성** — 프로젝트 URL 및 anon key, service_role key 환경변수 준비
- [ ] **Supabase 테이블 생성** — 아래 SQL 실행
  ```sql
  -- 매장 테이블
  CREATE TABLE stores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
  );

  -- 문의 테이블
  CREATE TABLE inquiries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id uuid NOT NULL REFERENCES stores(id),
    store_name text NOT NULL,
    content text NOT NULL,
    category text NOT NULL CHECK (category IN ('전기', '배관', '에어컨', '시설', '기타')),
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    admin_note text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  -- updated_at 자동 갱신 트리거
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  ```
- [ ] **Supabase RLS 정책 설정**
  ```sql
  -- stores: 누구나 읽기/쓰기 가능 (입주자 매장 자동 생성)
  ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "stores_all" ON stores FOR ALL USING (true) WITH CHECK (true);

  -- inquiries: 누구나 읽기/삽입 가능, 수정은 인증된 사용자만
  ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "inquiries_read" ON inquiries FOR SELECT USING (true);
  CREATE POLICY "inquiries_insert" ON inquiries FOR INSERT WITH CHECK (true);
  CREATE POLICY "inquiries_update" ON inquiries FOR UPDATE USING (auth.role() = 'authenticated');
  ```
- [ ] **Next.js 프로젝트 초기화** — `npx create-next-app@latest` (TypeScript, Tailwind CSS, App Router 선택)
- [ ] **환경변수 설정** — `.env.local` 파일 생성
  ```
  NEXT_PUBLIC_SUPABASE_URL=<프로젝트 URL>
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
  ```
- [ ] **패키지 설치** — `@supabase/ssr`, `@supabase/supabase-js`, `react-hook-form`, `zod`, `@hookform/resolvers`, `zustand`
- [ ] **shadcn/ui 초기화** — `npx shadcn@latest init`, 필요한 컴포넌트 추가: `button`, `input`, `textarea`, `select`, `badge`, `card`, `form`, `toast`
- [ ] **TypeScript 타입 정의** — `src/types/store.ts`, `src/types/inquiry.ts` 작성
- [ ] **Zod 스키마 작성** — `src/lib/validations/inquiry.ts` 작성
- [ ] **Supabase 클라이언트 작성** — `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` 작성
- [ ] **Supabase 관리자 계정 생성** — Supabase 콘솔 Authentication에서 이메일/비밀번호 계정 수동 추가

### Phase 2: 백엔드 (API Route Handlers)

- [ ] **POST /api/inquiries** — `src/app/api/inquiries/route.ts`
  - Zod 유효성 검사
  - `stores` upsert (name 기준)
  - `inquiries` INSERT
  - `{ id, shortId }` 반환
- [ ] **GET /api/inquiries** — `src/app/api/inquiries/route.ts`
  - `storeName` 쿼리 파라미터 필수 검증
  - `inquiries` SELECT (store_name 조건, created_at DESC)
  - admin_note 제외한 `InquirySummary[]` 반환
- [ ] **POST /api/admin/auth/login** — `src/app/api/admin/auth/login/route.ts`
  - Zod 유효성 검사
  - `supabase.auth.signInWithPassword` 호출
  - 성공 시 `{ redirectTo: '/admin' }` 반환, 세션 쿠키 자동 설정
- [ ] **POST /api/admin/auth/logout** — `src/app/api/admin/auth/logout/route.ts`
  - `supabase.auth.signOut` 호출
  - `{ success: true }` 반환
- [ ] **GET /api/admin/inquiries** — `src/app/api/admin/inquiries/route.ts`
  - 서버 클라이언트로 세션 검증 (없으면 401)
  - `status`, `category`, `page`, `limit` 쿼리 파라미터 파싱
  - `inquiries` SELECT (필터 조건 적용, created_at DESC, 페이지네이션)
  - `Inquiry[]` 반환
- [ ] **GET /api/admin/inquiries/[id]** — `src/app/api/admin/inquiries/[id]/route.ts`
  - 세션 검증
  - 단건 조회, 없으면 404
- [ ] **PATCH /api/admin/inquiries/[id]** — `src/app/api/admin/inquiries/[id]/route.ts`
  - 세션 검증
  - Zod 유효성 검사
  - `inquiries` UPDATE (`status`, `admin_note` 부분 업데이트)
  - 갱신된 `Inquiry` 반환

### Phase 3: 프론트엔드 (컴포넌트 및 페이지)

- [ ] **공용 컴포넌트** — `InquiryStatusBadge.tsx`, `InquiryCategoryBadge.tsx` 구현
  - status/category 값에 따른 색상 매핑 (예: PENDING=노란색, IN_PROGRESS=파란색, COMPLETED=초록색)
- [ ] **홈 페이지** — `src/app/page.tsx`
  - "문의 등록" 버튼 → `/inquiry/new`
  - "내 문의 조회" 버튼 → `/inquiry/check`
  - "관리자 로그인" 링크 → `/admin/login`
- [ ] **문의 등록 폼** — `src/components/inquiry/InquiryForm.tsx`
  - React Hook Form + Zod (`createInquirySchema`) 연동
  - 매장명, 카테고리 셀렉트, 문의 내용 텍스트에어리어 (글자 수 표시)
  - 제출 시 `POST /api/inquiries` 호출
  - 성공 시 shortId 표시 및 이동 버튼
- [ ] **문의 등록 페이지** — `src/app/inquiry/new/page.tsx` — `InquiryForm` 래핑
- [ ] **Zustand 스토어** — `src/store/inquiryStore.ts` 구현
- [ ] **문의 카드** — `src/components/inquiry/InquiryCard.tsx`
  - 카테고리 뱃지, 문의 내용 요약, status 뱃지, 등록일 표시
  - 클릭 시 전체 내용 인라인 확장 (accordion 패턴)
- [ ] **내 문의 조회 페이지** — `src/app/inquiry/check/page.tsx`
  - 매장명 입력 폼 (`checkInquirySchema`)
  - 조회 시 `GET /api/inquiries?storeName=<매장명>` 호출
  - `InquiryCard` 목록 렌더링, 빈 결과 처리
- [ ] **관리자 로그인 페이지** — `src/app/admin/login/page.tsx`
  - `adminLoginSchema` 연동
  - `POST /api/admin/auth/login` 호출
  - 성공 시 `/admin` 리다이렉트, 실패 시 에러 메시지 표시
- [ ] **관리자 레이아웃** — `src/app/admin/layout.tsx`
  - 서버 컴포넌트에서 Supabase 세션 검증
  - 미인증 시 `/admin/login`으로 redirect
  - 인증 시 네비게이션(대시보드 링크 + 로그아웃 버튼) 렌더링
- [ ] **Zustand 관리자 스토어** — `src/store/adminStore.ts` 구현
- [ ] **관리자 필터** — `src/components/admin/InquiryFilter.tsx`
  - status 셀렉트, 카테고리 셀렉트
  - Zustand `adminStore`와 연동
- [ ] **관리자 문의 목록 테이블** — `src/components/admin/InquiryTable.tsx`
  - 열: 매장명, 카테고리, 내용 요약, status 뱃지, 등록일, 상세 보기 링크
  - 행 클릭 시 `/admin/inquiry/[id]`로 이동
- [ ] **관리자 대시보드 페이지** — `src/app/admin/page.tsx`
  - `GET /api/admin/inquiries` 호출 (필터 쿼리 파라미터 포함)
  - `InquiryFilter` + `InquiryTable` 조합
- [ ] **관리자 문의 상세 폼** — `src/components/admin/InquiryDetailForm.tsx`
  - status 셀렉트 + admin_note 텍스트에어리어
  - `updateInquirySchema` 연동
  - `PATCH /api/admin/inquiries/[id]` 호출, 성공 시 토스트 메시지
- [ ] **관리자 문의 상세 페이지** — `src/app/admin/inquiry/[id]/page.tsx`
  - 서버 컴포넌트에서 `GET /api/admin/inquiries/[id]` 조회
  - 문의 정보 표시 + `InquiryDetailForm` 조합

### Phase 4: 검증

- [ ] **에러 핸들링 일관성 확인** — 모든 API 라우트에서 try-catch 및 에러 응답 형식(`{ error: string }`) 확인
- [ ] **로딩 상태 처리** — 폼 제출, API 조회 중 버튼 비활성화 및 로딩 스피너 표시 확인
- [ ] **반응형 레이아웃 확인** — 모바일(375px), 태블릿(768px), 데스크톱(1280px) 브레이크포인트에서 UI 확인
- [ ] **엣지 케이스 수동 테스트**
  - 빈 매장명으로 문의 조회 시도
  - 500자 초과 문의 내용 입력 시도
  - 관리자 로그인 실패 3회 연속 시도
  - 존재하지 않는 문의 id URL 직접 접근
  - 세션 만료 후 관리자 API 요청
- [ ] **Vercel 배포 설정** — 환경변수 설정 후 배포, 프로덕션 URL에서 동작 확인

---

## 8. 리스크 및 확인 필요 사항

| 리스크 | 심각도 | 대응 방안 |
|--------|--------|-----------|
| 입주자가 매장명을 다르게 입력하여 문의 조회 불가 | 높음 | UI에서 정확한 매장명 입력 안내 문구 강조. 향후 매장 목록 자동완성 고려 |
| Supabase anon key로 입주자 API를 공개 운영 시 타 매장 문의 내용 노출 | 높음 | 입주자 조회 API에서 `admin_note` 필드 반드시 제외. RLS로 SELECT 허용 범위 재검토 |
| 관리자 계정 탈취 시 전체 문의 데이터 노출 | 높음 | Supabase Auth 강력한 비밀번호 정책 적용. MVP에서는 MFA 미적용 |
| Vercel 배포 후 Supabase SSR 쿠키 설정 오류 | 중간 | `@supabase/ssr` 공식 문서의 Next.js 15 설정 정확히 따름. 배포 직후 로그인 세션 유지 여부 검증 |
| `updated_at` 트리거 미작동으로 이력 추적 오류 | 낮음 | Phase 1 완료 후 Supabase 콘솔에서 트리거 동작 확인 쿼리 실행 |
| 동시에 같은 문의 status 변경 시 충돌 | 낮음 | MVP에서는 낙관적 업데이트 없이 매번 최신 데이터 조회 방식으로 회피 |
