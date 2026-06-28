'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import 'react-day-picker/style.css';

/** 날짜를 'YYYY-MM-DD' 문자열로 변환 */
function toDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** 'YYYY-MM-DD' 문자열을 Date 객체로 변환 */
function fromDateStr(str: string): Date {
  return parseISO(str);
}

/** 관리자 날짜 범위 필터 컴포넌트 */
export default function DateRangePicker() {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = useAdminStore();

  // 팝오버 내부 임시 상태 — 조회 버튼을 눌러야 스토어에 반영
  const [localFrom, setLocalFrom] = useState<Date | undefined>(
    dateFrom ? fromDateStr(dateFrom) : undefined
  );
  const [localTo, setLocalTo] = useState<Date | undefined>(
    dateTo ? fromDateStr(dateTo) : undefined
  );
  const [open, setOpen] = useState(false);

  const triggerLabel =
    dateFrom && dateTo
      ? `${dateFrom} ~ ${dateTo}`
      : dateFrom
        ? `${dateFrom} ~`
        : dateTo
          ? `~ ${dateTo}`
          : '기간 선택';

  const handleApply = () => {
    setDateFrom(localFrom ? toDateStr(localFrom) : null);
    setDateTo(localTo ? toDateStr(localTo) : null);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalFrom(undefined);
    setLocalTo(undefined);
    setDateFrom(null);
    setDateTo(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-sm font-normal"
          />
        }
      >
        <CalendarIcon className="size-3.5 text-muted-foreground" />
        <span className={dateFrom || dateTo ? 'text-gray-900' : 'text-muted-foreground'}>
          {triggerLabel}
        </span>
      </PopoverTrigger>

      <PopoverContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* 달력 두 개 나란히 */}
          <div className="flex gap-4">
            {/* 시작일 달력 */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-gray-500">시작일</p>
              <DayPicker
                mode="single"
                selected={localFrom}
                onSelect={setLocalFrom}
                locale={ko}
                disabled={localTo ? { after: localTo } : undefined}
                captionLayout="dropdown"
              />
            </div>

            <div className="w-px bg-border" />

            {/* 종료일 달력 */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-gray-500">종료일</p>
              <DayPicker
                mode="single"
                selected={localTo}
                onSelect={setLocalTo}
                locale={ko}
                disabled={localFrom ? { before: localFrom } : undefined}
                captionLayout="dropdown"
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
              초기화
            </Button>
            <Button type="button" size="sm" onClick={handleApply}>
              조회
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
