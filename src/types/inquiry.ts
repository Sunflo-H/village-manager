/** 문의 상태 */
export type InquiryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

/** 문의 카테고리 */
export type InquiryCategory = '전기' | '배관' | '에어컨' | '시설' | '기타';

/** inquiries 테이블 전체 타입 */
export interface Inquiry {
  id: string;               // uuid
  store_id: string;         // uuid, FK → stores.id
  store_name: string;       // 비정규화 — 매장명 변경 이력 보존용
  content: string;          // 문의 내용
  category: InquiryCategory;
  status: InquiryStatus;
  admin_note: string | null; // 관리자 메모
  image_urls: string[];     // 첨부 이미지 URL 목록
  created_at: string;       // timestamptz
  updated_at: string;       // timestamptz
}

/** 입주자 문의 조회용 — 관리자 전용 필드(admin_note, store_id, pin) 제외 */
export type InquirySummary = Pick<
  Inquiry,
  'id' | 'store_name' | 'content' | 'category' | 'status' | 'created_at' | 'image_urls'
>;

/** POST /api/inquiries 요청 */
export interface CreateInquiryRequest {
  storeName: string;        // 1~50자
  content: string;          // 1~500자
  category: InquiryCategory;
  pin: string;              // 4~8자리 숫자
  imageUrls?: string[];     // 첨부 이미지 URL 목록 (최대 3장)
}

/** POST /api/inquiries 응답 */
export interface CreateInquiryResponse {
  id: string;
  shortId: string;          // id 앞 8자리 (사용자에게 표시)
}

/** GET /api/inquiries 응답 */
export interface GetInquiriesResponse {
  inquiries: InquirySummary[];
}

/** PATCH /api/admin/inquiries/[id] 요청 */
export interface UpdateInquiryRequest {
  status?: InquiryStatus;
  admin_note?: string;
}

/** PATCH /api/admin/inquiries/[id] 응답 */
export interface UpdateInquiryResponse {
  inquiry: Inquiry;
}

/** 공통 에러 응답 */
export interface ApiErrorResponse {
  error: string;
}
