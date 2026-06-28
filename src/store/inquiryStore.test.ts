import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useInquiryStore } from './inquiryStore';
import type { InquirySummary } from '@/types/inquiry';

// ─────────────────────────────────────────────────────────────
// 테스트용 목 데이터
// ─────────────────────────────────────────────────────────────
const mockInquiry: InquirySummary = {
  id: 'test-uuid-1234',
  store_name: '스타벅스',
  content: '에어컨이 작동하지 않습니다.',
  category: '에어컨',
  status: 'PENDING',
  created_at: '2026-06-26T00:00:00Z',
  image_urls: [],
};

// ─────────────────────────────────────────────────────────────
// useInquiryStore 테스트
// ─────────────────────────────────────────────────────────────
describe('useInquiryStore', () => {
  // 각 테스트 전에 스토어 초기화
  beforeEach(() => {
    useInquiryStore.getState().reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('초기 상태', () => {
    it('초기 storeName은 빈 문자열이어야 한다', () => {
      expect(useInquiryStore.getState().storeName).toBe('');
    });

    it('초기 pin은 빈 문자열이어야 한다', () => {
      expect(useInquiryStore.getState().pin).toBe('');
    });

    it('초기 inquiries는 빈 배열이어야 한다', () => {
      expect(useInquiryStore.getState().inquiries).toEqual([]);
    });

    it('초기 isLoading은 false여야 한다', () => {
      expect(useInquiryStore.getState().isLoading).toBe(false);
    });

    it('초기 error는 null이어야 한다', () => {
      expect(useInquiryStore.getState().error).toBeNull();
    });
  });

  describe('setStoreName', () => {
    it('매장명을 설정할 수 있어야 한다', () => {
      useInquiryStore.getState().setStoreName('스타벅스');
      expect(useInquiryStore.getState().storeName).toBe('스타벅스');
    });

    it('빈 문자열로도 설정할 수 있어야 한다', () => {
      useInquiryStore.getState().setStoreName('스타벅스');
      useInquiryStore.getState().setStoreName('');
      expect(useInquiryStore.getState().storeName).toBe('');
    });
  });

  describe('fetchInquiries', () => {
    it('API 호출 성공 시 inquiries를 업데이트해야 한다', async () => {
      const mockResponse = { inquiries: [mockInquiry] };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await useInquiryStore.getState().fetchInquiries('스타벅스', '1234');

      const state = useInquiryStore.getState();
      expect(state.inquiries).toEqual([mockInquiry]);
      expect(state.storeName).toBe('스타벅스');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('API 호출 중에는 isLoading이 true여야 한다', async () => {
      let resolvePromise!: (value: Response) => void;
      const pendingPromise = new Promise<Response>((resolve) => {
        resolvePromise = resolve;
      });

      global.fetch = vi.fn().mockReturnValueOnce(pendingPromise);

      const fetchPromise = useInquiryStore.getState().fetchInquiries('스타벅스', '1234');
      expect(useInquiryStore.getState().isLoading).toBe(true);

      resolvePromise({
        ok: true,
        json: async () => ({ inquiries: [] }),
      } as Response);

      await fetchPromise;
      expect(useInquiryStore.getState().isLoading).toBe(false);
    });

    it('API 응답이 ok=false인 경우 error를 설정하고 isLoading을 false로 해야 한다', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '조회 실패' }),
      } as Response);

      await useInquiryStore.getState().fetchInquiries('없는매장', '1234');

      const state = useInquiryStore.getState();
      expect(state.error).toBe('조회 실패');
      expect(state.isLoading).toBe(false);
      expect(state.inquiries).toEqual([]);
    });

    it('API 응답에 error 필드가 없으면 기본 에러 메시지를 사용해야 한다', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await useInquiryStore.getState().fetchInquiries('없는매장', '1234');

      const state = useInquiryStore.getState();
      expect(state.error).toBe('조회 중 오류가 발생했습니다');
    });

    it('네트워크 오류 발생 시 일시적 오류 메시지를 설정해야 한다', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network Error'));

      await useInquiryStore.getState().fetchInquiries('스타벅스', '1234');

      const state = useInquiryStore.getState();
      expect(state.error).toBe('일시적인 오류가 발생했습니다. 다시 시도해 주세요');
      expect(state.isLoading).toBe(false);
    });

    it('올바른 URL(storeName과 pin URL 인코딩 포함)로 fetch를 호출해야 한다', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ inquiries: [] }),
      } as Response);

      await useInquiryStore.getState().fetchInquiries('스타벅스 강남점', '1234');

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/inquiries?storeName=${encodeURIComponent('스타벅스 강남점')}&pin=${encodeURIComponent('1234')}`
      );
    });
  });

  describe('reset', () => {
    it('reset 호출 시 모든 상태가 초기값으로 돌아와야 한다', async () => {
      // 상태 변경
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ inquiries: [mockInquiry] }),
      } as Response);
      await useInquiryStore.getState().fetchInquiries('스타벅스', '1234');

      // reset 실행
      useInquiryStore.getState().reset();

      const state = useInquiryStore.getState();
      expect(state.storeName).toBe('');
      expect(state.pin).toBe('');
      expect(state.inquiries).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
