import Link from 'next/link';
import type { Metadata } from 'next';
import InquiryForm from '@/components/inquiry/InquiryForm';

export const metadata: Metadata = {
  title: '문의 등록 | 매장 문의 관리',
};

/** 문의 등록 페이지 */
export default function InquiryNewPage() {
  return (
    <main className="min-h-dvh bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        {/* 상단 네비게이션 */}
        <nav className="mb-6">
          <Link
            href="/"
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
            홈으로
          </Link>
        </nav>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-xl font-bold text-gray-900">문의 등록</h1>
          <InquiryForm />
        </div>
      </div>
    </main>
  );
}
