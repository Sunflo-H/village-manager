import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INQUIRY_STATUSES, INQUIRY_CATEGORIES } from '@/lib/validations/inquiry';
import type { Inquiry, InquiryStatus, InquiryCategory } from '@/types/inquiry';

/** GET /api/admin/inquiries — 관리자 문의 목록 조회 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 사용자 검증 (getUser는 매 호출마다 서버 검증)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const categoryParam = searchParams.get('category');
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const offset = (page - 1) * limit;

    // YYYY-MM-DD 형식 검증
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const dateFrom = dateFromParam && datePattern.test(dateFromParam) ? dateFromParam : null;
    const dateTo = dateToParam && datePattern.test(dateToParam) ? dateToParam : null;

    // 유효한 status/category 값인지 검증
    const status =
      statusParam && (INQUIRY_STATUSES as readonly string[]).includes(statusParam)
        ? (statusParam as InquiryStatus)
        : null;

    const category =
      categoryParam && (INQUIRY_CATEGORIES as readonly string[]).includes(categoryParam)
        ? (categoryParam as InquiryCategory)
        : null;

    // 쿼리 빌드 — 필터 조건 적용
    let query = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
    if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);

    const { data, error } = await query;

    if (error) {
      console.error('관리자 문의 목록 조회 오류:', error);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    const inquiries: Inquiry[] = (data ?? []) as Inquiry[];

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('GET /api/admin/inquiries 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
