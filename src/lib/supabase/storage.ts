import { createClient } from '@/lib/supabase/client';

const BUCKET = 'inquiry-images';

/** 브라우저에서 이미지를 Supabase Storage에 업로드하고 공개 URL 배열을 반환 */
export async function uploadInquiryImages(files: File[]): Promise<string[]> {
  const supabase = createClient();
  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}
