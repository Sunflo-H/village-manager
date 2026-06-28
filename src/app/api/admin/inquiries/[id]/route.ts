import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateInquirySchema } from '@/lib/validations/inquiry';
import type { Inquiry } from '@/types/inquiry';

/** GET /api/admin/inquiries/[id] — 관리자 문의 단건 조회 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '존재하지 않는 문의입니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({ inquiry: data as Inquiry });
  } catch (error) {
    console.error('GET /api/admin/inquiries/[id] 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/** PATCH /api/admin/inquiries/[id] — 관리자 문의 수정 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    const result = updateInquirySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const updateData: Partial<{ status: string; admin_note: string }> = {};
    if (result.data.status !== undefined) updateData.status = result.data.status;
    if (result.data.admin_note !== undefined) updateData.admin_note = result.data.admin_note;

    // 수정할 필드가 없으면 400 반환
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '수정할 항목이 없습니다' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('inquiries')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json(
          { error: '존재하지 않는 문의입니다' },
          { status: 404 }
        );
      }
      console.error('문의 수정 오류:', error);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({ inquiry: data as Inquiry });
  } catch (error) {
    console.error('PATCH /api/admin/inquiries/[id] 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
