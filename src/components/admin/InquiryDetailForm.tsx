'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  updateInquirySchema,
  INQUIRY_STATUSES,
  type UpdateInquiryInput,
} from '@/lib/validations/inquiry';
import type { Inquiry, InquiryStatus, UpdateInquiryResponse } from '@/types/inquiry';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InquiryDetailFormProps {
  inquiry: Inquiry;
}

/** 상태 라벨 매핑 */
const STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: '대기 중',
  IN_PROGRESS: '처리 중',
  COMPLETED: '완료',
};

/** 관리자 문의 상세 편집 폼 */
export default function InquiryDetailForm({ inquiry }: InquiryDetailFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateInquiryInput>({
    resolver: zodResolver(updateInquirySchema),
    defaultValues: {
      status: inquiry.status,
      admin_note: inquiry.admin_note ?? '',
    },
  });

  /** 저장 처리 */
  const onSubmit = async (data: UpdateInquiryInput) => {
    setSubmitError(null);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: UpdateInquiryResponse | { error: string } = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        const errorResult = result as { error: string };
        setSubmitError(errorResult.error ?? '저장 중 오류가 발생했습니다');
        return;
      }

      // 성공 토스트 표시 후 페이지 갱신
      toast.success('저장되었습니다');
      router.refresh();
    } catch {
      setSubmitError('일시적인 오류가 발생했습니다. 다시 시도해 주세요');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* 상태 변경 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">처리 상태</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <SelectTrigger id="status" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INQUIRY_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && (
          <p className="text-xs text-red-600">{errors.status.message}</p>
        )}
      </div>

      {/* 관리자 메모 */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin_note">관리자 메모</Label>
        <Textarea
          id="admin_note"
          placeholder="처리 내용이나 메모를 입력해 주세요"
          rows={4}
          aria-invalid={!!errors.admin_note}
          {...register('admin_note')}
        />
        {errors.admin_note && (
          <p className="text-xs text-red-600">{errors.admin_note.message}</p>
        )}
      </div>

      {/* 서버 에러 메시지 */}
      {submitError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{submitError}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !isDirty}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? '저장 중...' : '저장'}
      </Button>
    </form>
  );
}
