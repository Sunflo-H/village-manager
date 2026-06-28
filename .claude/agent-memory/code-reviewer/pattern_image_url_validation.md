---
name: pattern-image-url-validation
description: POST /api/inquiries에서 imageUrls가 외부 URL인지 검증하지 않음.
metadata:
  type: project
---

`src/app/api/inquiries/route.ts` POST 핸들러는 클라이언트가 보낸 imageUrls 배열을 그대로 DB에 저장. Storage 도메인 여부를 검증하지 않음.

**Why:** 악의적인 요청자가 임의 외부 URL을 imageUrls에 넣어 저장할 수 있음. 또한 Storage에 이미지를 올리지 않고도 문의를 등록할 수 있음.

**How to apply:** imageUrls 각 항목이 자신의 Supabase Storage 공개 URL 패턴(`process.env.NEXT_PUBLIC_SUPABASE_URL/storage/v1/object/public/inquiry-images/`)으로 시작하는지 서버에서 검증하도록 권고.
