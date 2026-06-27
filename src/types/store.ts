/** stores 테이블 타입 */
export interface Store {
  id: string;          // uuid
  name: string;        // 매장명 (UNIQUE)
  created_at: string;  // timestamptz (ISO 8601)
}
