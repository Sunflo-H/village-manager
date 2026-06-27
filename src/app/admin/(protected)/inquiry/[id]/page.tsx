import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Inquiry } from '@/types/inquiry';
import InquiryStatusBadge from '@/components/inquiry/InquiryStatusBadge';
import InquiryCategoryBadge from '@/components/inquiry/InquiryCategoryBadge';
import InquiryDetailForm from '@/components/admin/InquiryDetailForm';

interface AdminInquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

/** 날짜 포맷 헬퍼 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 관리자 문의 상세 페이지 */
export default async function AdminInquiryDetailPage({
  params,
}: AdminInquiryDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 문의 단건 조회
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  const inquiry = data as Inquiry;

  return (
    <div className="flex flex-col gap-6">
      {/* 상단 네비게이션 */}
      <nav>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          목록으로
        </Link>
      </nav>

      {/* 문의 정보 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <InquiryCategoryBadge category={inquiry.category} />
          <InquiryStatusBadge status={inquiry.status} />
        </div>

        <h1 className="mb-1 text-lg font-bold text-gray-900">{inquiry.store_name}</h1>
        <p className="mb-4 font-mono text-xs text-gray-400"># {inquiry.id.slice(0, 8)}</p>

        <dl className="mb-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 font-medium text-gray-500">등록일</dt>
            <dd className="text-gray-700">{formatDate(inquiry.created_at)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 font-medium text-gray-500">최종 수정</dt>
            <dd className="text-gray-700">{formatDate(inquiry.updated_at)}</dd>
          </div>
        </dl>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm whitespace-pre-wrap text-gray-700">{inquiry.content}</p>
        </div>
      </div>

      {/* 상태 및 메모 편집 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">처리 정보</h2>
        <InquiryDetailForm inquiry={inquiry} />
      </div>
    </div>
  );
}
