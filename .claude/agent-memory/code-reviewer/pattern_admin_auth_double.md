---
name: pattern-admin-auth-double
description: 관리자 인증이 layout(서버 컴포넌트)과 API Route 양쪽에서 별도로 체크되는 이중 구조.
metadata:
  type: project
---

`src/app/admin/(protected)/layout.tsx`는 getSession()으로 UI 진입을 막고, API Route들도 각자 getSession()으로 인증 체크. 미들웨어(middleware.ts) 없이 두 레이어에서 분산 관리됨.

**Why:** 미들웨어가 없으면 API Route를 직접 호출하면 layout의 리다이렉트를 우회할 수 있음. API에서도 체크하므로 보안은 유지되지만, 일관성 있는 단일 지점 인증이 아님.

**How to apply:** middleware.ts를 추가해 `/api/admin/**` 경로를 일괄 보호하면 API Route 각각의 인증 체크를 제거하거나 보조 수단으로 유지할 수 있음. 현재는 API Route 레벨 체크가 실질적 보안선.
