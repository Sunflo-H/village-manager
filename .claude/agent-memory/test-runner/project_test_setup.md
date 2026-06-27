---
name: project-test-setup
description: village-manager 프로젝트의 테스트 환경 설정 정보 (명령어, 파일 위치, 컨벤션)
metadata:
  type: project
---

## 테스트 환경

**프레임워크**: vitest v4 + @testing-library/react + jsdom  
**설정 파일**: `/Users/hwangbyeongjun/workspace/village-manager/vitest.config.ts`  
**setup 파일**: `/Users/hwangbyeongjun/workspace/village-manager/src/test/setup.ts`

## 테스트 명령어

- 전체 1회 실행: `npm run test:run`
- watch 모드: `npm run test`

**Why:** test:run은 CI 용도, test는 개발 중 watch 모드용으로 분리함.

## 테스트 파일 위치 및 네이밍

- 소스 파일과 같은 디렉토리에 `[파일명].test.ts` 패턴으로 위치
- 예시: `src/lib/validations/inquiry.test.ts`, `src/store/inquiryStore.test.ts`

## 작성 컨벤션

- `describe` 중첩: 최상위 → '정상 케이스' / '에러 케이스' / '엣지 케이스' 순서
- Zustand 스토어 테스트: `beforeEach`에서 `store.getState().reset()` 또는 `resetFilters()` 호출
- `vi.fn()` / `vi.restoreAllMocks()`로 fetch mock 처리 (afterEach 복원)
- TypeScript strict: 타입 단언(`as const`) 적극 활용, `any` 금지

## 현재 테스트 파일 목록 (2026-06-26 기준)

- `src/lib/validations/inquiry.test.ts` — Zod 스키마 4종 검증 (43 테스트)
- `src/store/inquiryStore.test.ts` — 입주자 조회 Zustand 스토어 (12 테스트)
- `src/store/adminStore.test.ts` — 관리자 필터 Zustand 스토어 (12 테스트)
- 합계: **63 테스트 전원 통과**

## Zod v4 주의사항

- `z.enum`의 커스텀 에러: `{ errorMap: () => ({ message: '...' }) }` 대신 `{ error: '...' }` 사용
- 에러 이슈 접근: `result.error.issues` (v4 API)
- `safeParse` 반환 타입: `{ success: true; data: T } | { success: false; error: ZodError }`
