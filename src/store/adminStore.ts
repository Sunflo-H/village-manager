import { create } from 'zustand';
import type { InquiryStatus, InquiryCategory } from '@/types/inquiry';

interface AdminStore {
  statusFilter: InquiryStatus | 'ALL';
  categoryFilter: InquiryCategory | 'ALL';
  dateFrom: string | null;
  dateTo: string | null;
  setStatusFilter: (status: InquiryStatus | 'ALL') => void;
  setCategoryFilter: (category: InquiryCategory | 'ALL') => void;
  setDateFrom: (date: string | null) => void;
  setDateTo: (date: string | null) => void;
  resetFilters: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  statusFilter: 'ALL',
  categoryFilter: 'ALL',
  dateFrom: null,
  dateTo: null,

  setStatusFilter: (status) => set({ statusFilter: status }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setDateFrom: (date) => set({ dateFrom: date }),
  setDateTo: (date) => set({ dateTo: date }),

  resetFilters: () =>
    set({
      statusFilter: 'ALL',
      categoryFilter: 'ALL',
      dateFrom: null,
      dateTo: null,
    }),
}));
