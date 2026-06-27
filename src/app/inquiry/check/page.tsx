'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkInquirySchema, type CheckInquiryInput } from '@/lib/validations/inquiry';
import { useInquiryStore } from '@/store/inquiryStore';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InquiryCard from '@/components/inquiry/InquiryCard';

/** 내 문의 조회 페이지 */
export default function InquiryCheckPage() {
  const { inquiries, isLoading, error, storeName, fetchInquiries } = useInquiryStore();
  // 조회 결과 유무 판별 (한 번이라도 조회가 실행됐는지)
  const hasSearched = storeName !== '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckInquiryInput>({
    resolver: zodResolver(checkInquirySchema),
    defaultValues: { storeName },
  });

  const onSubmit = async (data: CheckInquiryInput) => {
    await fetchInquiries(data.storeName.trim());
  };

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
          <h1 className="mb-6 text-xl font-bold text-gray-900">내 문의 조회</h1>

          {/* 조회 폼 */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeName">매장명</Label>
              <div className="flex gap-2">
                <Input
                  id="storeName"
                  placeholder="매장명을 입력해 주세요"
                  aria-invalid={!!errors.storeName}
                  {...register('storeName')}
                />
                <Button type="submit" disabled={isLoading} className="shrink-0">
                  {isLoading ? '조회 중...' : '조회'}
                </Button>
              </div>
              {errors.storeName && (
                <p className="text-xs text-red-600">{errors.storeName.message}</p>
              )}
            </div>
          </form>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 조회 결과 */}
        {hasSearched && !isLoading && !error && (
          <div className="mt-6">
            {inquiries.length > 0 ? (
              <>
                <p className="mb-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{storeName}</span>의
                  문의 {inquiries.length}건
                </p>
                <ul className="flex flex-col gap-3">
                  {inquiries.map((inquiry) => (
                    <li key={inquiry.id}>
                      <InquiryCard inquiry={inquiry} />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
                <p className="mb-4 text-sm text-gray-500">
                  <span className="font-medium">{storeName}</span>으로 등록된
                  문의가 없습니다
                </p>
                <Link
                  href="/inquiry/new"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  문의 등록하기
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
