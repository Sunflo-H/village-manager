---
name: pattern-get-session
description: 관리자 API Route에서 getSession() 사용 중. 서버 측 인증에는 getUser()가 필요.
metadata:
  type: project
---

`src/app/api/admin/inquiries/route.ts`, `[id]/route.ts` 모두 `supabase.auth.getSession()`으로 인증 체크.

**Why:** getSession()은 로컬 쿠키 캐시를 읽어 서버 검증 없이 반환할 수 있어, 변조된 JWT로 우회 가능. Supabase 공식 문서는 서버에서 getUser() 사용을 권장.

**How to apply:** 관리자 API Route 코드 리뷰 시 getSession vs getUser 사용 여부를 반드시 체크. getUser()는 매 요청마다 Supabase 서버에 검증 요청을 보냄.
