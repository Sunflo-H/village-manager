---
name: pattern-object-url-leak
description: InquiryForm의 removeImage와 handleFileChange에서 URL.revokeObjectURL 미호출로 메모리 누수 발생.
metadata:
  type: project
---

`src/components/inquiry/InquiryForm.tsx`의 `removeImage`와 `handleFileChange`에서 `URL.createObjectURL`로 생성한 URL을 교체/제거할 때 `URL.revokeObjectURL`을 호출하지 않음.

**Why:** Object URL은 명시적으로 해제하지 않으면 페이지가 닫힐 때까지 메모리에 유지됨. 이미지를 여러 번 추가/제거하면 누수가 쌓임.

**How to apply:** removeImage 시 제거되는 URL, handleFileChange 시 이전 previewUrls에 대해 revokeObjectURL 호출. 또는 useEffect cleanup에서 일괄 처리.
