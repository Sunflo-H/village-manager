import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '매장 문의 관리 시스템',
  description: '빌라/상가 입주 매장의 시설 보수 문의를 등록하고 처리 현황을 확인하세요',
};

/** 홈 페이지 — 테넌트/관리자 진입점 선택 */
export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      {/* 관리자 로그인 — 우측 상단 고정 */}
      <div className="absolute right-4 top-4">
        <Link
          href="/admin/login"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          관리자 로그인
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            매장 문의 관리
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            시설 보수 문의를 등록하거나 처리 현황을 확인하세요
          </p>
        </div>

        {/* 테넌트 섹션 */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">테넌트</h2>
          <p className="mb-4 text-sm text-gray-500">
            로그인 없이 매장명만으로 문의를 등록하고 조회할 수 있습니다
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/inquiry/new"
              className={cn(buttonVariants({ variant: 'default' }), 'flex-1 justify-center')}
            >
              문의 등록
            </Link>
            <Link
              href="/inquiry/check"
              className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 justify-center')}
            >
              내 문의 조회
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
