import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { createInquirySchema, checkInquirySchema } from '@/lib/validations/inquiry';
import type { InquirySummary } from '@/types/inquiry';

/** PIN을 단방향 해싱 — 평문 저장 방지 */
function hashPin(pin: string): string {
  const salt = process.env.PIN_HASH_SALT ?? 'village-manager-default-salt';
  return createHmac('sha256', salt).update(pin).digest('hex');
}

/** POST /api/inquiries — 문의 등록 */
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const result = createInquirySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { storeName, content, category, pin, imageUrls } = result.data;
    const trimmedStoreName = storeName.trim();

    const supabase = await createClient();

    // 매장 upsert — 동시 요청 경쟁 조건 방지
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .upsert({ name: trimmedStoreName }, { onConflict: 'name' })
      .select('id')
      .single();

    if (storeError || !store) {
      console.error('매장 생성/조회 오류:', storeError);
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 문의 INSERT (PIN 해싱 후 저장)
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .insert({
        store_id: store.id,
        store_name: trimmedStoreName,
        content,
        category,
        status: 'PENDING',
        pin: hashPin(pin),
        image_urls: imageUrls ?? [],
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

/** GET /api/inquiries?storeName=<매장명>&pin=<PIN> — 입주자 문의 목록 조회 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // checkInquirySchema로 쿼리 파라미터 검증
    const result = checkInquirySchema.safeParse({
      storeName: searchParams.get('storeName') ?? '',
      pin: searchParams.get('pin') ?? '',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { storeName, pin } = result.data;
    const supabase = await createClient();

    // store_name과 해시된 pin이 모두 일치하는 문의만 조회
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, store_name, content, category, status, created_at, image_urls')
      .eq('store_name', storeName.trim())
      .eq('pin', hashPin(pin.trim()))
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
