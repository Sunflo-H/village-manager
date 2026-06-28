import { z } from 'zod';

/** 문의 카테고리 목록 */
export const INQUIRY_CATEGORIES = ['전기', '배관', '에어컨', '시설', '기타'] as const;

/** 문의 상태 목록 */
export const INQUIRY_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;

/** PIN 유효성: 4~8자리 숫자 */
const pinSchema = z
  .string()
  .min(4, 'PIN은 4자리 이상 입력해 주세요')
  .max(8, 'PIN은 8자리 이하로 입력해 주세요')
  .regex(/^\d+$/, '숫자만 입력해 주세요');

/** 문의 등록 폼 스키마 */
export const createInquirySchema = z.object({
  storeName: z
    .string()
    .min(1, '매장명을 입력해 주세요')
    .max(50, '매장명은 50자 이내로 입력해 주세요'),
  content: z
    .string()
    .min(1, '문의 내용을 입력해 주세요')
    .max(500, '문의 내용은 500자 이내로 입력해 주세요'),
  category: z.enum(INQUIRY_CATEGORIES, {
    error: '카테고리를 선택해 주세요',
  }),
  pin: pinSchema,
  imageUrls: z.array(z.string()).max(3).optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;

/** 매장명 조회 폼 스키마 */
export const checkInquirySchema = z.object({
  storeName: z.string().min(1, '매장명을 입력해 주세요'),
  pin: pinSchema,
});

export type CheckInquiryInput = z.infer<typeof checkInquirySchema>;

/** 관리자 문의 수정 스키마 */
export const updateInquirySchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  admin_note: z
    .string()
    .max(1000, '관리자 메모는 1000자 이내로 입력해 주세요')
    .optional(),
});

export type UpdateInquiryInput = z.infer<typeof updateInquirySchema>;

/** 관리자 로그인 스키마 */
export const adminLoginSchema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해 주세요'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
