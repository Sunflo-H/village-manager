import { cn } from '@/lib/utils';
import type { InquiryStatus } from '@/types/inquiry';

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
  className?: string;
}

/** status별 색상 및 라벨 매핑 */
const STATUS_MAP: Record<InquiryStatus, { label: string; className: string }> = {
  PENDING: {
    label: '대기 중',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  IN_PROGRESS: {
    label: '처리 중',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  COMPLETED: {
    label: '완료',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
};

/** 문의 상태 배지 컴포넌트 */
export default function InquiryStatusBadge({
  status,
  className,
}: InquiryStatusBadgeProps) {
  const { label, className: statusClassName } = STATUS_MAP[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusClassName,
        className
      )}
    >
      {label}
    </span>
  );
}
