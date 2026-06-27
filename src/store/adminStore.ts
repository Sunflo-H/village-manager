// 용도: 관리자 필터 상태 관리

import { create } from 'zustand';
import type { InquiryStatus, InquiryCategory } from '@/types/inquiry';

interface AdminStore {
  statusFilter: InquiryStatus | 'ALL';
  categoryFilter: InquiryCategory | 'ALL';
  setStatusFilter: (status: InquiryStatus | 'ALL') => void;
  setCategoryFilter: (category: InquiryCategory | 'ALL') => void;
  resetFilters: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  statusFilter: 'ALL',
  categoryFilter: 'ALL',

  setStatusFilter: (status: InquiryStatus | 'ALL') =>
    set({ statusFilter: status }),

  setCategoryFilter: (category: InquiryCategory | 'ALL') =>
    set({ categoryFilter: category }),

  resetFilters: () =>
    set({
      statusFilter: 'ALL',
      categoryFilter: 'ALL',
    }),
}));
