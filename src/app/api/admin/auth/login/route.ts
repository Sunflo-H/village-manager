import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminLoginSchema } from '@/lib/validations/inquiry';

/** POST /api/admin/auth/login — 관리자 로그인 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Zod 유효성 검사
    const result = adminLoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const supabase = await createClient();

    // Supabase Auth 로그인
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('관리자 로그인 오류:', error);
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      );
    }

    return NextResponse.json({ redirectTo: '/admin' });
  } catch (error) {
    console.error('POST /api/admin/auth/login 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
