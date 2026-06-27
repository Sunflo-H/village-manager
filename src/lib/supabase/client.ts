// 용도: 클라이언트 컴포넌트에서 사용 (브라우저 환경)
// 주의: 민감한 작업(관리자 인증 확인 등)에 사용 금지

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
