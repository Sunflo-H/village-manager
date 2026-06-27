'use client';

import { useAdminStore } from '@/store/adminStore';
import { INQUIRY_CATEGORIES, INQUIRY_STATUSES } from '@/lib/validations/inquiry';
import type { InquiryStatus, InquiryCategory } from '@/types/inquiry';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

/** 상태 라벨 매핑 */
const STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: '대기 중',
  IN_PROGRESS: '처리 중',
  COMPLETED: '완료',
};

/** 관리자 문의 필터 컴포넌트 */
export default function InquiryFilter() {
  const { statusFilter, categoryFilter, setStatusFilter, setCategoryFilter, resetFilters } =
    useAdminStore();

  const handleStatusChange = (value: string | null) => {
    if (!value) return;
    setStatusFilter(value as InquiryStatus | 'ALL');
  };

  const handleCategoryChange = (value: string | null) => {
    if (!value) return;
    setCategoryFilter(value as InquiryCategory | 'ALL');
  };

  const handleReset = () => {
    resetFilters();
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* 상태 필터 */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-gray-500">상태</Label>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {INQUIRY_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-gray-500">카테고리</Label>
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {INQUIRY_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 필터 초기화 */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleReset}
        className="h-8"
      >
        초기화
      </Button>
    </div>
  );
}
