import { cn } from '@/lib/utils';
import type { InquiryCategory } from '@/types/inquiry';

interface InquiryCategoryBadgeProps {
  category: InquiryCategory;
  className?: string;
}

/** category별 색상 매핑 */
const CATEGORY_MAP: Record<InquiryCategory, { className: string }> = {
  전기: { className: 'bg-orange-100 text-orange-800 border-orange-200' },
  배관: { className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  에어컨: { className: 'bg-sky-100 text-sky-800 border-sky-200' },
  시설: { className: 'bg-purple-100 text-purple-800 border-purple-200' },
  기타: { className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

/** 문의 카테고리 배지 컴포넌트 */
export default function InquiryCategoryBadge({
  category,
  className,
}: InquiryCategoryBadgeProps) {
  const { className: categoryClassName } = CATEGORY_MAP[category];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        categoryClassName,
        className
      )}
    >
      {category}
    </span>
  );
}
