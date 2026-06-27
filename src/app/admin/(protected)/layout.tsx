import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AdminLogoutButton from './AdminLogoutButton';

/** 관리자 레이아웃 — 세션 검증 + 네비게이션 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 세션 검증 — 없으면 로그인 페이지로 리다이렉트
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 로그인 페이지는 레이아웃에서 제외
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* 관리자 네비게이션 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-semibold text-gray-900 hover:text-blue-600"
            >
              관리자 대시보드
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{session.user.email}</span>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      {/* 콘텐츠 영역 */}
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
