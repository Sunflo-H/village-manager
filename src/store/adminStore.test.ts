import { describe, it, expect, beforeEach } from 'vitest';
import { useAdminStore } from './adminStore';

// ─────────────────────────────────────────────────────────────
// useAdminStore 테스트
// ─────────────────────────────────────────────────────────────
describe('useAdminStore', () => {
  // 각 테스트 전에 필터 초기화
  beforeEach(() => {
    useAdminStore.getState().resetFilters();
  });

  describe('초기 상태', () => {
    it('초기 statusFilter는 "ALL"이어야 한다', () => {
      expect(useAdminStore.getState().statusFilter).toBe('ALL');
    });

    it('초기 categoryFilter는 "ALL"이어야 한다', () => {
      expect(useAdminStore.getState().categoryFilter).toBe('ALL');
    });
  });

  describe('setStatusFilter', () => {
    it('PENDING으로 statusFilter를 설정할 수 있어야 한다', () => {
      useAdminStore.getState().setStatusFilter('PENDING');
      expect(useAdminStore.getState().statusFilter).toBe('PENDING');
    });

    it('IN_PROGRESS로 statusFilter를 설정할 수 있어야 한다', () => {
      useAdminStore.getState().setStatusFilter('IN_PROGRESS');
      expect(useAdminStore.getState().statusFilter).toBe('IN_PROGRESS');
    });

    it('COMPLETED로 statusFilter를 설정할 수 있어야 한다', () => {
      useAdminStore.getState().setStatusFilter('COMPLETED');
      expect(useAdminStore.getState().statusFilter).toBe('COMPLETED');
    });

    it('ALL로 statusFilter를 설정할 수 있어야 한다', () => {
      useAdminStore.getState().setStatusFilter('PENDING');
      useAdminStore.getState().setStatusFilter('ALL');
      expect(useAdminStore.getState().statusFilter).toBe('ALL');
    });
  });

  describe('setCategoryFilter', () => {
    it('전기 카테고리로 categoryFilter를 설정할 수 있어야 한다', () => {
      useAdminStore.getState().setCategoryFilter('전기');
      expect(useAdminStore.getState().categoryFilter).toBe('전기');
    });

    it('배관 카테고리로 categoryFilter를 설정할 수 있어야 한다', () => {
      useAdminStore.getState().setCategoryFilter('배관');
      expect(useAdminStore.getState().categoryFilter).toBe('배관');
    });

    it('에어컨 카테고리로 categoryFilter를 설정할 수 있어야 한다', () => {
      useAdminStore.getState().setCategoryFilter('에어컨');
      expect(useAdminStore.getState().categoryFilter).toBe('에어컨');
    });

    it('시설 카테고리로 categoryFilter를 설정할 수 있어야 한다', () => {
      useAdminStore.getState().setCategoryFilter('시설');
      expect(useAdminStore.getState().categoryFilter).toBe('시설');
    });

    it('기타 카테고리로 categoryFilter를 설정할 수 있어야 한다', () => {
      useAdminStore.getState().setCategoryFilter('기타');
      expect(useAdminStore.getState().categoryFilter).toBe('기타');
    });

    it('ALL로 categoryFilter를 설정할 수 있어야 한다', () => {
      useAdminStore.getState().setCategoryFilter('전기');
      useAdminStore.getState().setCategoryFilter('ALL');
      expect(useAdminStore.getState().categoryFilter).toBe('ALL');
    });
  });

  describe('resetFilters', () => {
    it('reset 시 statusFilter와 categoryFilter가 ALL로 돌아와야 한다', () => {
      useAdminStore.getState().setStatusFilter('COMPLETED');
      useAdminStore.getState().setCategoryFilter('전기');

      useAdminStore.getState().resetFilters();

      expect(useAdminStore.getState().statusFilter).toBe('ALL');
      expect(useAdminStore.getState().categoryFilter).toBe('ALL');
    });

    it('이미 ALL인 상태에서 reset을 호출해도 문제가 없어야 한다', () => {
      useAdminStore.getState().resetFilters();

      expect(useAdminStore.getState().statusFilter).toBe('ALL');
      expect(useAdminStore.getState().categoryFilter).toBe('ALL');
    });
  });

  describe('독립성 검증', () => {
    it('statusFilter 변경이 categoryFilter에 영향을 미치지 않아야 한다', () => {
      useAdminStore.getState().setCategoryFilter('배관');
      useAdminStore.getState().setStatusFilter('IN_PROGRESS');

      expect(useAdminStore.getState().categoryFilter).toBe('배관');
    });

    it('categoryFilter 변경이 statusFilter에 영향을 미치지 않아야 한다', () => {
      useAdminStore.getState().setStatusFilter('PENDING');
      useAdminStore.getState().setCategoryFilter('에어컨');

      expect(useAdminStore.getState().statusFilter).toBe('PENDING');
    });
  });
});
