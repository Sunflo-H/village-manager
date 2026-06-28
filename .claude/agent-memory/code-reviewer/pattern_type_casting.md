---
name: pattern-type-casting
description: Supabase 응답 데이터를 `as Type`으로 강제 캐스팅하는 패턴이 전체 API에 반복됨.
metadata:
  type: project
---

`data as Inquiry`, `data as InquirySummary[]` 등의 패턴이 모든 API Route에 걸쳐 사용됨.

**Why:** Supabase의 자동 타입 생성(supabase gen types)을 사용하지 않고, 수동으로 만든 타입을 캐스팅함. DB 스키마 변경 시 런타임 불일치가 타입 에러 없이 통과됨.

**How to apply:** 향후 Supabase CLI로 DB 타입을 자동 생성하거나, 최소한 Zod로 응답을 파싱하도록 개선 권고.
