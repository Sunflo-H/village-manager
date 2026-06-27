-- ============================================================
-- 매장 문의 관리 시스템 MVP 스키마
-- ============================================================

-- 매장 테이블
CREATE TABLE stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 문의 테이블
CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id),
  store_name text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('전기', '배관', '에어컨', '시설', '기타')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 등록
CREATE TRIGGER inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================

-- stores: 누구나 읽기/쓰기 가능 (입주자 매장 자동 생성)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_all" ON stores FOR ALL USING (true) WITH CHECK (true);

-- inquiries: 누구나 읽기/삽입 가능, 수정은 인증된 사용자만
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inquiries_read" ON inquiries FOR SELECT USING (true);
CREATE POLICY "inquiries_insert" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_update" ON inquiries FOR UPDATE USING (auth.role() = 'authenticated');
