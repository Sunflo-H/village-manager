'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

/** 관리자 로그아웃 버튼 */
export default function AdminLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch {
      // 로그아웃 실패 시에도 로그인 페이지로 이동
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className="h-7 text-xs"
    >
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </Button>
  );
}
