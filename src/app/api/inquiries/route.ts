import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInquirySchema } from '@/lib/validations/inquiry';
import type { InquirySummary } from '@/types/inquiry';

/** POST /api/inquiries — 문의 등록 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Zod 유효성 검사
    const result = createInquirySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { storeName, content, category } = result.data;
    // 앞뒤 공백 제거
    const trimmedStoreName = storeName.trim();

    const supabase = await createClient();

    // stores 테이블에서 매장명 조회 (없으면 신규 생성)
    let storeId: string;
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('name', trimmedStoreName)
      .single();

    if (existingStore) {
      storeId = existingStore.id as string;
    } else {
      const { data: newStore, error: storeError } = await supabase
        .from('stores')
        .insert({ name: trimmedStoreName })
        .select('id')
        .single();

      if (storeError || !newStore) {
        console.error('매장 생성 오류:', storeError);
        return NextResponse.json(
          { error: '서버 오류가 발생했습니다' },
          { status: 500 }
        );
      }
      storeId = newStore.id as string;
    }

    // 문의 INSERT
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        store_id: storeId,
        store_name: trimmedStoreName,
        content,
        category,
        status: 'PENDING',
      })
      .select('id')
      .single();

    if (inquiryError || !inquiry) {
      console.error('문의 등록 오류:', inquiryError);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    const id = inquiry.id as string;

    return NextResponse.json(
      { id, shortId: id.slice(0, 8) },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/inquiries 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/** GET /api/inquiries?storeName=<매장명> — 입주자 문의 목록 조회 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeName = searchParams.get('storeName');

    // storeName 필수 검증
    if (!storeName || storeName.trim() === '') {
      return NextResponse.json(
        { error: '매장명을 입력해 주세요' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('inquiries')
      .select('id, store_name, content, category, status, created_at')
      .eq('store_name', storeName.trim())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('문의 조회 오류:', error);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    const inquiries: InquirySummary[] = (data ?? []) as InquirySummary[];

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('GET /api/inquiries 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
