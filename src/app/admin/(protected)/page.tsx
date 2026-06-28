'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import type { Inquiry } from '@/types/inquiry';
import InquiryFilter from '@/components/admin/InquiryFilter';
import InquiryTable from '@/components/admin/InquiryTable';

/** 관리자 대시보드 페이지 */
export default function AdminDashboardPage() {
  const { statusFilter, categoryFilter, dateFrom, dateTo } = useAdminStore();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 변경 시 데이터 재조회
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'ALL') params.set('status', statusFilter);
        if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);

        const response = await fetch(`/api/admin/inquiries?${params.toString()}`);
        const data: { inquiries: Inquiry[] } | { error: string } = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          const errorData = data as { error: string };
          setError(errorData.error ?? '목록 조회 중 오류가 발생했습니다');
          return;
        }

        const successData = data as { inquiries: Inquiry[] };
        setInquiries(successData.inquiries);
      } catch {
        if (!cancelled) {
          setError('일시적인 오류가 발생했습니다. 다시 시도해 주세요');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, categoryFilter, dateFrom, dateTo]);

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">문의 목록</h1>
        {!isLoading && (
          <span className="text-sm text-gray-500">총 {inquiries.length}건</span>
        )}
      </div>

      {/* 필터 */}
      <InquiryFilter />

      {/* 목록 */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">불러오는 중...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <InquiryTable inquiries={inquiries} />
      )}
    </div>
  );
}
