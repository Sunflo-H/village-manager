---
name: pattern-pin-plaintext
description: PIN이 DB에 평문으로 저장되는 보안 취약점. 최초 전체 리뷰(2026-06-28)에서 발견.
metadata:
  type: project
---

PIN이 `src/app/api/inquiries/route.ts`의 INSERT 쿼리에서 평문 그대로 DB에 저장됨.

**Why:** MVP 단계에서 빠르게 구현했지만, Supabase 대시보드나 DB 직접 조회 시 모든 PIN이 노출됨.

**How to apply:** 문의 등록/조회 API 리뷰 시 반드시 PIN 해싱 여부를 확인할 것. bcrypt 또는 crypto.subtle 기반 해싱 권고.
