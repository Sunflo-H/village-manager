import { describe, it, expect } from 'vitest';
import {
  createInquirySchema,
  checkInquirySchema,
  updateInquirySchema,
  adminLoginSchema,
  INQUIRY_CATEGORIES,
  INQUIRY_STATUSES,
} from './inquiry';

// ─────────────────────────────────────────────────────────────
// createInquirySchema 테스트
// ─────────────────────────────────────────────────────────────
describe('createInquirySchema', () => {
  describe('정상 케이스', () => {
    it('유효한 입력이 모두 전달되면 파싱에 성공해야 한다', () => {
      const input = {
        storeName: '스타벅스',
        content: '에어컨이 작동하지 않습니다.',
        category: '에어컨' as const,
        pin: '1234',
      };
      const result = createInquirySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.storeName).toBe('스타벅스');
        expect(result.data.content).toBe('에어컨이 작동하지 않습니다.');
        expect(result.data.category).toBe('에어컨');
        expect(result.data.pin).toBe('1234');
      }
    });

    it('모든 유효한 카테고리 값을 허용해야 한다', () => {
      INQUIRY_CATEGORIES.forEach((category) => {
        const result = createInquirySchema.safeParse({
          storeName: '테스트매장',
          content: '문의 내용입니다.',
          category,
          pin: '1234',
        });
        expect(result.success).toBe(true);
      });
    });

    it('매장명 최대 50자를 허용해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: 'a'.repeat(50),
        content: '문의 내용입니다.',
        category: '시설' as const,
        pin: '1234',
      });
      expect(result.success).toBe(true);
    });

    it('문의 내용 최대 500자를 허용해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: 'a'.repeat(500),
        category: '기타' as const,
        pin: '1234',
      });
      expect(result.success).toBe(true);
    });

    it('imageUrls 없이도 파싱에 성공해야 한다 (optional 필드)', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '문의 내용입니다.',
        category: '전기' as const,
        pin: '1234',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.imageUrls).toBeUndefined();
      }
    });

    it('imageUrls 최대 3개까지 허용해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '문의 내용입니다.',
        category: '전기' as const,
        pin: '1234',
        imageUrls: ['https://example.com/1.jpg', 'https://example.com/2.jpg', 'https://example.com/3.jpg'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.imageUrls).toHaveLength(3);
      }
    });

    it('PIN 8자리 숫자를 허용해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '문의 내용입니다.',
        category: '전기' as const,
        pin: '12345678',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('에러 케이스: storeName', () => {
    it('빈 매장명은 "매장명을 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '',
        content: '문의 내용입니다.',
        category: '전기' as const,
        pin: '1234',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const storeNameError = result.error.issues.find(
          (issue) => issue.path[0] === 'storeName'
        );
        expect(storeNameError?.message).toBe('매장명을 입력해 주세요');
      }
    });

    it('매장명 51자 초과 시 "매장명은 50자 이내로 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: 'a'.repeat(51),
        content: '문의 내용입니다.',
        category: '전기' as const,
        pin: '1234',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const storeNameError = result.error.issues.find(
          (issue) => issue.path[0] === 'storeName'
        );
        expect(storeNameError?.message).toBe('매장명은 50자 이내로 입력해 주세요');
      }
    });
  });

  describe('에러 케이스: content', () => {
    it('빈 문의 내용은 "문의 내용을 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '',
        category: '배관' as const,
        pin: '1234',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const contentError = result.error.issues.find(
          (issue) => issue.path[0] === 'content'
        );
        expect(contentError?.message).toBe('문의 내용을 입력해 주세요');
      }
    });

    it('문의 내용 501자 초과 시 "문의 내용은 500자 이내로 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: 'a'.repeat(501),
        category: '배관' as const,
        pin: '1234',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const contentError = result.error.issues.find(
          (issue) => issue.path[0] === 'content'
        );
        expect(contentError?.message).toBe('문의 내용은 500자 이내로 입력해 주세요');
      }
    });
  });

  describe('에러 케이스: pin', () => {
    it('pin 필드가 누락되면 실패해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '문의 내용입니다.',
        category: '전기' as const,
      });
      expect(result.success).toBe(false);
    });

    it('PIN이 3자리 이하면 "PIN은 4자리 이상 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '문의 내용입니다.',
        category: '전기' as const,
        pin: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pinError = result.error.issues.find(
          (issue) => issue.path[0] === 'pin'
        );
        expect(pinError?.message).toBe('PIN은 4자리 이상 입력해 주세요');
      }
    });

    it('PIN이 9자리 이상이면 "PIN은 8자리 이하로 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '문의 내용입니다.',
        category: '전기' as const,
        pin: '123456789',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pinError = result.error.issues.find(
          (issue) => issue.path[0] === 'pin'
        );
        expect(pinError?.message).toBe('PIN은 8자리 이하로 입력해 주세요');
      }
    });

    it('PIN에 숫자가 아닌 문자가 포함되면 "숫자만 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '문의 내용입니다.',
        category: '전기' as const,
        pin: '12ab',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pinError = result.error.issues.find(
          (issue) => issue.path[0] === 'pin'
        );
        expect(pinError?.message).toBe('숫자만 입력해 주세요');
      }
    });
  });

  describe('에러 케이스: imageUrls', () => {
    it('imageUrls가 4개 이상이면 실패해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '문의 내용입니다.',
        category: '전기' as const,
        pin: '1234',
        imageUrls: ['url1', 'url2', 'url3', 'url4'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('에러 케이스: category', () => {
    it('허용되지 않은 카테고리 값은 "카테고리를 선택해 주세요" 에러를 반환해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '문의 내용입니다.',
        category: '잘못된카테고리',
        pin: '1234',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const categoryError = result.error.issues.find(
          (issue) => issue.path[0] === 'category'
        );
        expect(categoryError?.message).toBe('카테고리를 선택해 주세요');
      }
    });

    it('category 필드가 누락되면 실패해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: '문의 내용입니다.',
        pin: '1234',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('엣지 케이스', () => {
    it('storeName 앞뒤 공백만 있는 경우(공백 1자) 파싱에 성공해야 한다 (trim은 API 레이어 책임)', () => {
      // 기획 문서: storeName.trim()으로 앞뒤 공백 제거는 API에서 처리
      // 스키마 자체는 공백 포함 1자 이상이면 통과
      const result = createInquirySchema.safeParse({
        storeName: ' ',
        content: '문의 내용입니다.',
        category: '기타' as const,
        pin: '1234',
      });
      expect(result.success).toBe(true);
    });

    it('storeName 정확히 1자는 허용해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: 'A',
        content: '문의 내용입니다.',
        category: '시설' as const,
        pin: '1234',
      });
      expect(result.success).toBe(true);
    });

    it('content 정확히 1자는 허용해야 한다', () => {
      const result = createInquirySchema.safeParse({
        storeName: '테스트매장',
        content: 'A',
        category: '시설' as const,
        pin: '1234',
      });
      expect(result.success).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// checkInquirySchema 테스트
// ─────────────────────────────────────────────────────────────
describe('checkInquirySchema', () => {
  describe('정상 케이스', () => {
    it('매장명과 PIN이 모두 있으면 파싱에 성공해야 한다', () => {
      const result = checkInquirySchema.safeParse({ storeName: '스타벅스', pin: '1234' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.storeName).toBe('스타벅스');
        expect(result.data.pin).toBe('1234');
      }
    });

    it('PIN 4자리 최솟값을 허용해야 한다', () => {
      const result = checkInquirySchema.safeParse({ storeName: '스타벅스', pin: '1234' });
      expect(result.success).toBe(true);
    });

    it('PIN 8자리 최댓값을 허용해야 한다', () => {
      const result = checkInquirySchema.safeParse({ storeName: '스타벅스', pin: '12345678' });
      expect(result.success).toBe(true);
    });
  });

  describe('에러 케이스', () => {
    it('빈 매장명은 "매장명을 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = checkInquirySchema.safeParse({ storeName: '', pin: '1234' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const storeNameError = result.error.issues.find(
          (issue) => issue.path[0] === 'storeName'
        );
        expect(storeNameError?.message).toBe('매장명을 입력해 주세요');
      }
    });

    it('storeName 필드가 누락되면 실패해야 한다', () => {
      const result = checkInquirySchema.safeParse({ pin: '1234' });
      expect(result.success).toBe(false);
    });

    it('PIN이 누락되면 실패해야 한다', () => {
      const result = checkInquirySchema.safeParse({ storeName: '스타벅스' });
      expect(result.success).toBe(false);
    });

    it('PIN이 3자리 이하면 "PIN은 4자리 이상 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = checkInquirySchema.safeParse({ storeName: '스타벅스', pin: '123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pinError = result.error.issues.find(
          (issue) => issue.path[0] === 'pin'
        );
        expect(pinError?.message).toBe('PIN은 4자리 이상 입력해 주세요');
      }
    });

    it('PIN이 9자리 이상이면 "PIN은 8자리 이하로 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = checkInquirySchema.safeParse({ storeName: '스타벅스', pin: '123456789' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pinError = result.error.issues.find(
          (issue) => issue.path[0] === 'pin'
        );
        expect(pinError?.message).toBe('PIN은 8자리 이하로 입력해 주세요');
      }
    });

    it('PIN에 숫자가 아닌 문자가 포함되면 "숫자만 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = checkInquirySchema.safeParse({ storeName: '스타벅스', pin: '12ab' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pinError = result.error.issues.find(
          (issue) => issue.path[0] === 'pin'
        );
        expect(pinError?.message).toBe('숫자만 입력해 주세요');
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────
// updateInquirySchema 테스트
// ─────────────────────────────────────────────────────────────
describe('updateInquirySchema', () => {
  describe('정상 케이스', () => {
    it('빈 객체(필드 모두 optional)도 파싱에 성공해야 한다', () => {
      const result = updateInquirySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('status만 단독으로 업데이트할 수 있어야 한다', () => {
      INQUIRY_STATUSES.forEach((status) => {
        const result = updateInquirySchema.safeParse({ status });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.status).toBe(status);
        }
      });
    });

    it('admin_note만 단독으로 업데이트할 수 있어야 한다', () => {
      const result = updateInquirySchema.safeParse({ admin_note: '점검 완료' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.admin_note).toBe('점검 완료');
      }
    });

    it('status와 admin_note 동시 업데이트가 가능해야 한다', () => {
      const result = updateInquirySchema.safeParse({
        status: 'IN_PROGRESS' as const,
        admin_note: '담당자 배정 완료',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('IN_PROGRESS');
        expect(result.data.admin_note).toBe('담당자 배정 완료');
      }
    });

    it('admin_note 정확히 1000자는 허용해야 한다', () => {
      const result = updateInquirySchema.safeParse({
        admin_note: 'a'.repeat(1000),
      });
      expect(result.success).toBe(true);
    });

    it('admin_note 빈 문자열도 허용해야 한다 (메모 초기화 시나리오)', () => {
      const result = updateInquirySchema.safeParse({ admin_note: '' });
      expect(result.success).toBe(true);
    });

    it('기획 문서 엣지 케이스: status 역방향 변경(COMPLETED → PENDING)도 허용해야 한다', () => {
      const result = updateInquirySchema.safeParse({ status: 'PENDING' as const });
      expect(result.success).toBe(true);
    });
  });

  describe('에러 케이스', () => {
    it('admin_note 1001자 초과 시 "관리자 메모는 1000자 이내로 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = updateInquirySchema.safeParse({
        admin_note: 'a'.repeat(1001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const noteError = result.error.issues.find(
          (issue) => issue.path[0] === 'admin_note'
        );
        expect(noteError?.message).toBe('관리자 메모는 1000자 이내로 입력해 주세요');
      }
    });

    it('허용되지 않은 status 값은 실패해야 한다', () => {
      const result = updateInquirySchema.safeParse({ status: 'INVALID_STATUS' });
      expect(result.success).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// adminLoginSchema 테스트
// ─────────────────────────────────────────────────────────────
describe('adminLoginSchema', () => {
  describe('정상 케이스', () => {
    it('유효한 이메일과 비밀번호로 파싱에 성공해야 한다', () => {
      const result = adminLoginSchema.safeParse({
        email: 'admin@example.com',
        password: 'securePassword123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('admin@example.com');
        expect(result.data.password).toBe('securePassword123');
      }
    });

    it('단순한 비밀번호(1자)도 허용해야 한다', () => {
      const result = adminLoginSchema.safeParse({
        email: 'admin@example.com',
        password: 'a',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('에러 케이스: email', () => {
    it('잘못된 이메일 형식은 "올바른 이메일 형식을 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = adminLoginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === 'email'
        );
        expect(emailError?.message).toBe('올바른 이메일 형식을 입력해 주세요');
      }
    });

    it('@가 없는 이메일은 유효성 검사에 실패해야 한다', () => {
      const result = adminLoginSchema.safeParse({
        email: 'notanemail',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('도메인이 없는 이메일은 유효성 검사에 실패해야 한다', () => {
      const result = adminLoginSchema.safeParse({
        email: 'user@',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('빈 이메일은 실패해야 한다', () => {
      const result = adminLoginSchema.safeParse({
        email: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('에러 케이스: password', () => {
    it('빈 비밀번호는 "비밀번호를 입력해 주세요" 에러를 반환해야 한다', () => {
      const result = adminLoginSchema.safeParse({
        email: 'admin@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === 'password'
        );
        expect(passwordError?.message).toBe('비밀번호를 입력해 주세요');
      }
    });

    it('password 필드가 누락되면 실패해야 한다', () => {
      const result = adminLoginSchema.safeParse({
        email: 'admin@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('엣지 케이스', () => {
    it('이메일과 비밀번호 두 필드 모두 실패하면 두 에러를 모두 반환해야 한다', () => {
      const result = adminLoginSchema.safeParse({
        email: 'invalid',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
