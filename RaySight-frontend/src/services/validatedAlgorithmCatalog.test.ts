import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearValidatedAlgorithms,
  deleteValidatedAlgorithm,
  getValidatedAlgorithm,
  isPromotionEligible,
  listValidatedAlgorithms,
  promoteValidatedAlgorithm,
  PROMOTION_THRESHOLD,
  updateValidatedAlgorithm,
  VALIDATED_ALGORITHMS_STORAGE_KEY,
} from './validatedAlgorithmCatalog';
import type { PipelineEvaluation } from './api';

describe('validatedAlgorithmCatalog', () => {
  beforeEach(() => {
    let uuidCounter = 0;

    localStorage.clear();
    clearValidatedAlgorithms();
    vi.useFakeTimers();
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => `test-uuid-${++uuidCounter}`),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    clearValidatedAlgorithms();
    localStorage.clear();
  });

  describe('isPromotionEligible', () => {
    it('returns true if coherenceScore is exactly PROMOTION_THRESHOLD', () => {
      expect(isPromotionEligible({ coherenceScore: PROMOTION_THRESHOLD })).toBe(true);
    });

    it('returns true if coherenceScore is greater than PROMOTION_THRESHOLD', () => {
      expect(isPromotionEligible({ coherenceScore: PROMOTION_THRESHOLD + 1 })).toBe(true);
    });

    it('returns false if coherenceScore is less than PROMOTION_THRESHOLD', () => {
      expect(isPromotionEligible({ coherenceScore: PROMOTION_THRESHOLD - 1 })).toBe(false);
    });

    it('returns false for null or undefined evaluation', () => {
      expect(isPromotionEligible(null)).toBe(false);
      expect(isPromotionEligible(undefined)).toBe(false);
    });
  });

  describe('listValidatedAlgorithms', () => {
    it('returns empty array when catalog is empty', () => {
      expect(listValidatedAlgorithms()).toEqual([]);
    });

    it('returns records sorted by promotedAt descending', () => {
      const evaluation: PipelineEvaluation = {
        coherenceScore: PROMOTION_THRESHOLD,
        explanation: 'Test',
        recommendation: 'Test',
        weakPoints: [],
        strongPoints: [],
        loopCompatible: false,
      };

      vi.setSystemTime(new Date('2024-01-01T10:00:00Z'));
      const oldRecord = promoteValidatedAlgorithm({ name: 'Old', nodes: [], edges: [], evaluation });

      vi.setSystemTime(new Date('2024-01-02T10:00:00Z'));
      const newRecord = promoteValidatedAlgorithm({ name: 'New', nodes: [], edges: [], evaluation });

      const list = listValidatedAlgorithms();
      expect(list).toHaveLength(2);
      expect(list[0]).toEqual(newRecord);
      expect(list[1]).toEqual(oldRecord);
    });
  });

  describe('getValidatedAlgorithm', () => {
    it('returns null if record does not exist', () => {
      expect(getValidatedAlgorithm('non-existent')).toBeNull();
    });

    it('returns the record if it exists', () => {
      const evaluation: PipelineEvaluation = {
        coherenceScore: PROMOTION_THRESHOLD,
        explanation: 'Test',
        recommendation: 'Test',
        weakPoints: [],
        strongPoints: [],
        loopCompatible: false,
      };

      const record = promoteValidatedAlgorithm({ name: 'Test', nodes: [], edges: [], evaluation });

      const fetched = getValidatedAlgorithm(record.id);
      expect(fetched).toEqual(record);
    });
  });

  describe('promoteValidatedAlgorithm', () => {
    it('throws an error if promotion is not eligible', () => {
      const evaluation: PipelineEvaluation = {
        coherenceScore: PROMOTION_THRESHOLD - 1,
        explanation: 'Test',
        recommendation: 'Test',
        weakPoints: [],
        strongPoints: [],
        loopCompatible: false,
      };

      expect(() => {
        promoteValidatedAlgorithm({
          name: 'Test Pipeline',
          nodes: [],
          edges: [],
          evaluation,
        });
      }).toThrowError(`Pipeline score must be at least ${PROMOTION_THRESHOLD}% to promote.`);
    });

    it('successfully promotes a valid algorithm and saves to localStorage', () => {
      const evaluation: PipelineEvaluation = {
        coherenceScore: PROMOTION_THRESHOLD,
        explanation: 'Test',
        recommendation: 'Test',
        weakPoints: [],
        strongPoints: [],
        loopCompatible: false,
      };

      const now = new Date('2024-01-01T12:00:00Z');
      vi.setSystemTime(now);

      const result = promoteValidatedAlgorithm({
        name: '  Valid Pipeline  ',
        description: '  A description  ',
        nodes: [{ id: 'n1', type: 'test', position: { x: 0, y: 0 }, data: { label: 'Node 1' } }],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
        evaluation,
        tags: ['test', 'ml'],
      });

      expect(result).toEqual({
        id: 'test-uuid-1',
        name: 'Valid Pipeline',
        description: 'A description',
        nodes: [{ id: 'n1', type: 'test', position: { x: 0, y: 0 }, data: { label: 'Node 1' } }],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
        evaluation,
        coherenceScore: PROMOTION_THRESHOLD,
        promotedAt: now.toISOString(),
        updatedAt: now.toISOString(),
        tags: ['test', 'ml'],
      });

      const storedCatalog = JSON.parse(localStorage.getItem(VALIDATED_ALGORITHMS_STORAGE_KEY) || '[]');
      expect(storedCatalog).toHaveLength(1);
      expect(storedCatalog[0]).toEqual(result);
    });

    it('uses default values when optional fields are omitted', () => {
      const evaluation: PipelineEvaluation = {
        coherenceScore: PROMOTION_THRESHOLD + 5,
        explanation: 'Test',
        recommendation: 'Test',
        weakPoints: [],
        strongPoints: [],
        loopCompatible: false,
      };

      const result = promoteValidatedAlgorithm({
        name: '',
        nodes: [],
        edges: [],
        evaluation,
      });

      expect(result.name).toBe('Validated pipeline');
      expect(result.description).toBeUndefined();
      expect(result.tags).toEqual([]);
    });
  });
  describe('updateValidatedAlgorithm', () => {
    it('returns null if record to update does not exist', () => {
      expect(updateValidatedAlgorithm('non-existent', { name: 'New Name' })).toBeNull();
    });

    it('updates fields and modifies updatedAt timestamp', () => {
      const evaluation: PipelineEvaluation = {
        coherenceScore: PROMOTION_THRESHOLD,
        explanation: 'Test',
        recommendation: 'Test',
        weakPoints: [],
        strongPoints: [],
        loopCompatible: false,
      };

      vi.setSystemTime(new Date('2024-01-01T10:00:00Z'));
      const record = promoteValidatedAlgorithm({ name: 'Old Name', nodes: [], edges: [], evaluation });

      vi.setSystemTime(new Date('2024-01-02T10:00:00Z'));
      const updated = updateValidatedAlgorithm(record.id, {
        name: 'New Name',
        description: 'New Description',
        tags: ['new-tag'],
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('New Name');
      expect(updated?.description).toBe('New Description');
      expect(updated?.tags).toEqual(['new-tag']);
      expect(updated?.updatedAt).toBe('2024-01-02T10:00:00.000Z');
      expect(updated?.promotedAt).toBe('2024-01-01T10:00:00.000Z');

      const fetched = getValidatedAlgorithm(record.id);
      expect(fetched).toEqual(updated);
    });
  });

  describe('deleteValidatedAlgorithm', () => {
    it('returns false if record does not exist', () => {
      expect(deleteValidatedAlgorithm('non-existent')).toBe(false);
    });

    it('removes record and returns true', () => {
      const evaluation: PipelineEvaluation = {
        coherenceScore: PROMOTION_THRESHOLD,
        explanation: 'Test',
        recommendation: 'Test',
        weakPoints: [],
        strongPoints: [],
        loopCompatible: false,
      };

      const record = promoteValidatedAlgorithm({ name: 'Test', nodes: [], edges: [], evaluation });
      expect(listValidatedAlgorithms()).toHaveLength(1);

      const deleted = deleteValidatedAlgorithm(record.id);
      expect(deleted).toBe(true);
      expect(listValidatedAlgorithms()).toHaveLength(0);

      const storedCatalog = JSON.parse(localStorage.getItem(VALIDATED_ALGORITHMS_STORAGE_KEY) || '[]');
      expect(storedCatalog).toHaveLength(0);
    });
  });

  describe('clearValidatedAlgorithms', () => {
    it('clears localStorage and in-memory cache', () => {
      const evaluation: PipelineEvaluation = {
        coherenceScore: PROMOTION_THRESHOLD,
        explanation: 'Test',
        recommendation: 'Test',
        weakPoints: [],
        strongPoints: [],
        loopCompatible: false,
      };

      promoteValidatedAlgorithm({ name: 'Test 1', nodes: [], edges: [], evaluation });
      promoteValidatedAlgorithm({ name: 'Test 2', nodes: [], edges: [], evaluation });

      expect(listValidatedAlgorithms()).toHaveLength(2);

      clearValidatedAlgorithms();

      expect(listValidatedAlgorithms()).toHaveLength(0);
      expect(localStorage.getItem(VALIDATED_ALGORITHMS_STORAGE_KEY)).toBeNull();
    });
  });
});
