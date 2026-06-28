'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  createInquirySchema,
  INQUIRY_CATEGORIES,
  type CreateInquiryInput,
} from '@/lib/validations/inquiry';
import type { CreateInquiryResponse } from '@/types/inquiry';
import { uploadInquiryImages } from '@/lib/supabase/storage';
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
  const [shortId, setShortId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 언마운트 시 Object URL 전체 해제
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateInquiryInput>({
    resolver: zodResolver(createInquirySchema),
    defaultValues: {
      storeName: '',
      content: '',
      pin: '',
    },
  });

  const contentValue = useWatch({ control, name: 'content', defaultValue: '' });
  const contentLength = contentValue?.length ?? 0;

  /** 이미지 파일 선택 처리 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const merged = [...previewFiles, ...selected].slice(0, 3);
    setPreviewFiles(merged);
    setPreviewUrls(merged.map((f) => URL.createObjectURL(f)));
    // form value는 제출 시 업로드 후 설정하므로 여기서는 초기화만
    setValue('imageUrls', []);
  };

  /** 이미지 제거 */
  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /** 폼 제출 처리 */
  const onSubmit = async (data: CreateInquiryInput) => {
    setSubmitError(null);
    try {
      // 이미지 먼저 업로드
      let imageUrls: string[] = [];
      if (previewFiles.length > 0) {
        try {
          imageUrls = await uploadInquiryImages(previewFiles);
        } catch {
          setSubmitError('이미지 업로드 중 오류가 발생했습니다. 다시 시도해 주세요');
          return;
        }
      }

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, imageUrls }),
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
            설정한 PIN과 매장명으로 나중에 조회할 수 있습니다
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
                <SelectValue placeholder="카테고리를 선택해 주세요">
                  {field.value ?? ''}
                </SelectValue>
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

      {/* 이미지 첨부 */}
      <div className="flex flex-col gap-1.5">
        <Label>사진 첨부 (선택, 최대 3장)</Label>

        {/* 미리보기 */}
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative h-24 w-24">
                <Image
                  src={url}
                  alt={`첨부 이미지 ${i + 1}`}
                  fill
                  className="rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-red-600"
                  aria-label="이미지 제거"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {previewFiles.length < 3 && (
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            사진 추가
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      {/* PIN 설정 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pin">PIN *</Label>
        <Input
          id="pin"
          type="password"
          inputMode="numeric"
          placeholder="숫자 4~8자리"
          maxLength={8}
          aria-invalid={!!errors.pin}
          {...register('pin')}
        />
        <p className="text-xs text-gray-400">
          나중에 문의 조회 시 필요하니 기억해 두세요
        </p>
        {errors.pin && (
          <p className="text-xs text-red-600">{errors.pin.message}</p>
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
