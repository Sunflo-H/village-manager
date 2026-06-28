// 용도: 입주자 문의 조회 결과 및 입력 상태 관리

import { create } from 'zustand';
import type { InquirySummary, GetInquiriesResponse } from '@/types/inquiry';

interface InquiryStore {
  storeName: string;           // 조회에 사용한 매장명
  pin: string;                 // 조회에 사용한 PIN
  inquiries: InquirySummary[];
  isLoading: boolean;
  error: string | null;
  setStoreName: (name: string) => void;
  fetchInquiries: (storeName: string, pin: string) => Promise<void>;
  reset: () => void;
}

export const useInquiryStore = create<InquiryStore>((set) => ({
  storeName: '',
  pin: '',
  inquiries: [],
  isLoading: false,
  error: null,

  setStoreName: (name: string) => set({ storeName: name }),

  fetchInquiries: async (storeName: string, pin: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `/api/inquiries?storeName=${encodeURIComponent(storeName)}&pin=${encodeURIComponent(pin)}`
      );
      const data: GetInquiriesResponse | { error: string } = await response.json();

      if (!response.ok) {
        const errorData = data as { error: string };
        set({ error: errorData.error ?? '조회 중 오류가 발생했습니다', isLoading: false });
        return;
      }

      const successData = data as GetInquiriesResponse;
      set({
        storeName,
        pin,
        inquiries: successData.inquiries,
        isLoading: false,
      });
    } catch {
      set({
        error: '일시적인 오류가 발생했습니다. 다시 시도해 주세요',
        isLoading: false,
      });
    }
  },

  reset: () =>
    set({
      storeName: '',
      pin: '',
      inquiries: [],
      isLoading: false,
      error: null,
    }),
}));
