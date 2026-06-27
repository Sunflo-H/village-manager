'use client';

import { useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  createInquirySchema,
  INQUIRY_CATEGORIES,
  type CreateInquiryInput,
} from '@/lib/validations/inquiry';
import type { CreateInquiryResponse } from '@/types/inquiry';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** 문의 등록 폼 컴포넌트 */
export default function InquiryForm() {
  const router = useRouter();
  // 등록 성공 후 표시할 shortId
  const [shortId, setShortId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateInquiryInput>({
    resolver: zodResolver(createInquirySchema),
    defaultValues: {
      storeName: '',
      content: '',
    },
  });

  // 글자 수 카운터용 content 길이 추적 (useWatch는 memoization 안전)
  const contentValue = useWatch({ control, name: 'content', defaultValue: '' });
  const contentLength = contentValue?.length ?? 0;

  /** 폼 제출 처리 */
  const onSubmit = async (data: CreateInquiryInput) => {
    setSubmitError(null);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: CreateInquiryResponse | { error: string } = await response.json();

      if (!response.ok) {
        const errorResult = result as { error: string };
        setSubmitError(errorResult.error ?? '문의 등록 중 오류가 발생했습니다');
        return;
      }

      const successResult = result as CreateInquiryResponse;
      setShortId(successResult.shortId);
    } catch {
      setSubmitError('일시적인 오류가 발생했습니다. 다시 시도해 주세요');
    }
  };

  // 등록 성공 화면
  if (shortId) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-7 w-7 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">문의가 등록되었습니다</h2>
          <p className="mt-2 text-sm text-gray-600">
            문의 번호:{' '}
            <span className="font-mono font-semibold text-gray-900">{shortId}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            이 번호를 기억해 두면 나중에 조회 시 참고할 수 있습니다
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/inquiry/check')}
            className="w-full sm:w-auto"
          >
            내 문의 조회
          </Button>
          <Button
            type="button"
            onClick={() => router.push('/')}
            className="w-full sm:w-auto"
          >
            홈으로
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* 매장명 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="storeName">매장명 *</Label>
        <Input
          id="storeName"
          placeholder="매장명을 입력해 주세요"
          aria-invalid={!!errors.storeName}
          {...register('storeName')}
        />
        {errors.storeName && (
          <p className="text-xs text-red-600">{errors.storeName.message}</p>
        )}
      </div>

      {/* 카테고리 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">카테고리 *</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? ''}
              onValueChange={(value) => {
                field.onChange(value);
              }}
            >
              <SelectTrigger
                id="category"
                className="w-full"
                aria-invalid={!!errors.category}
              >
                <SelectValue placeholder="카테고리를 선택해 주세요" />
              </SelectTrigger>
              <SelectContent>
                {INQUIRY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-xs text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* 문의 내용 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">문의 내용 *</Label>
          <span className="text-xs text-gray-400">
            {contentLength}/500
          </span>
        </div>
        <Textarea
          id="content"
          placeholder="문의 내용을 입력해 주세요"
          rows={5}
          aria-invalid={!!errors.content}
          {...register('content')}
        />
        {errors.content && (
          <p className="text-xs text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* 서버 에러 메시지 */}
      {submitError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{submitError}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? '등록 중...' : '문의 등록'}
      </Button>
    </form>
  );
}
