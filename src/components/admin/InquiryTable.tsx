'use client';

import Link from 'next/link';
import type { Inquiry } from '@/types/inquiry';
import InquiryStatusBadge from '@/components/inquiry/InquiryStatusBadge';
import InquiryCategoryBadge from '@/components/inquiry/InquiryCategoryBadge';

interface InquiryTableProps {
  inquiries: Inquiry[];
}

/** 날짜 포맷 헬퍼 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** 관리자 문의 목록 테이블 컴포넌트 */
export default function InquiryTable({ inquiries }: InquiryTableProps) {
  if (inquiries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <p className="text-sm text-gray-500">조건에 해당하는 문의가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      {/* 데스크톱 테이블 */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">매장명</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">카테고리</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">문의 내용</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">상태</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">등록일</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inquiries.map((inquiry) => (
              <tr
                key={inquiry.id}
                className="bg-white transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {inquiry.store_name}
                </td>
                <td className="px-4 py-3">
                  <InquiryCategoryBadge category={inquiry.category} />
                </td>
                <td className="max-w-xs px-4 py-3 text-gray-600">
                  {inquiry.content.length > 60
                    ? `${inquiry.content.slice(0, 60)}...`
                    : inquiry.content}
                </td>
                <td className="px-4 py-3">
                  <InquiryStatusBadge status={inquiry.status} />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(inquiry.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/inquiry/${inquiry.id}`}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드형 목록 */}
      <ul className="divide-y divide-gray-100 md:hidden">
        {inquiries.map((inquiry) => (
          <li key={inquiry.id}>
            <Link
              href={`/admin/inquiry/${inquiry.id}`}
              className="block p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-gray-900">{inquiry.store_name}</span>
                <time
                  dateTime={inquiry.created_at}
                  className="shrink-0 text-xs text-gray-400"
                >
                  {formatDate(inquiry.created_at)}
                </time>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <InquiryCategoryBadge category={inquiry.category} />
                <InquiryStatusBadge status={inquiry.status} />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {inquiry.content.length > 60
                  ? `${inquiry.content.slice(0, 60)}...`
                  : inquiry.content}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
