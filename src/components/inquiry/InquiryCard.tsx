'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { InquirySummary } from '@/types/inquiry';
import InquiryStatusBadge from './InquiryStatusBadge';
import InquiryCategoryBadge from './InquiryCategoryBadge';

interface InquiryCardProps {
  inquiry: InquirySummary;
}

/** 날짜 포맷 헬퍼 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** 문의 카드 컴포넌트 — 클릭 시 인라인 확장 */
export default function InquiryCard({ inquiry }: InquiryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const contentSummary =
    inquiry.content.length > 50
      ? `${inquiry.content.slice(0, 50)}...`
      : inquiry.content;

  const hasImages = inquiry.image_urls && inquiry.image_urls.length > 0;

  return (
    <div
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => setIsExpanded((prev) => !prev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded((prev) => !prev);
        }
      }}
      aria-expanded={isExpanded}
    >
      {/* 카드 헤더 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <InquiryCategoryBadge category={inquiry.category} />
          <InquiryStatusBadge status={inquiry.status} />
          {hasImages && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {inquiry.image_urls.length}
            </span>
          )}
        </div>
        <time
          dateTime={inquiry.created_at}
          className="shrink-0 text-xs text-gray-400"
        >
          {formatDate(inquiry.created_at)}
        </time>
      </div>

      {/* 문의 내용 요약 */}
      <p className="mt-3 text-sm text-gray-700">
        {isExpanded ? inquiry.content : contentSummary}
      </p>

      {/* 펼치기/접기 안내 */}
      <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
        <svg
          className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        {isExpanded ? '접기' : '자세히 보기'}
      </div>

      {/* 확장 시 추가 정보 */}
      {isExpanded && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          {/* 이미지 */}
          {hasImages && (
            <div className="mb-3 flex flex-wrap gap-2">
              {inquiry.image_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="relative h-20 w-20 overflow-hidden rounded-lg"
                >
                  <Image
                    src={url}
                    alt={`첨부 이미지 ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </a>
              ))}
            </div>
          )}

          <dl className="flex flex-col gap-1.5">
            <div className="flex gap-2 text-xs">
              <dt className="w-16 shrink-0 font-medium text-gray-500">등록 번호</dt>
              <dd className="font-mono text-gray-700">{inquiry.id.slice(0, 8)}</dd>
            </div>
            <div className="flex gap-2 text-xs">
              <dt className="w-16 shrink-0 font-medium text-gray-500">등록일</dt>
              <dd className="text-gray-700">{formatDate(inquiry.created_at)}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
