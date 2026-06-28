# Memory Index

- [PIN 평문 저장 패턴](pattern_pin_plaintext.md) — PIN이 DB에 평문 저장됨. 반복 확인 필요
- [getSession 보안 취약점](pattern_get_session.md) — 관리자 API에서 getSession() 사용 중. getUser()로 교체 필요
- [타입 캐스팅 패턴](pattern_type_casting.md) — Supabase 응답을 `as Type`으로 캐스팅하는 패턴이 전체 API에 걸쳐 반복됨
- [이미지 URL 검증 누락](pattern_image_url_validation.md) — imageUrls가 Supabase Storage 도메인인지 검증하지 않음
- [Object URL 누수](pattern_object_url_leak.md) — InquiryForm의 removeImage에서 URL.revokeObjectURL 미호출
- [관리자 페이지 인증 이중화](pattern_admin_auth_double.md) — layout과 API 양쪽에서 별도 인증 체크 구조
