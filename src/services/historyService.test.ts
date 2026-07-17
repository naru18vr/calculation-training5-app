import { describe, expect, it, vi } from 'vitest';
import type { QuizResult } from '../types';
import { MAX_HISTORY_ENTRIES } from '../constants';
import { normalizeHistory, readHistory, saveHistory } from './historyService';

const result = (endTime: number): QuizResult => ({
    studentId: 'grade5', grade: '小5', topic: { id: 'g5_average', name: '平均' }, difficulty: '標準',
    startTime: endTime - 1000, endTime,
    results: [{ question: { id: 0, text: '1+1', answer: '2', explanation: '1+1=2' }, attempts: 0, isCorrect: true, isSkipped: false }],
});

describe('history service', () => {
    it('keeps valid history while dropping damaged entries', () => {
        expect(normalizeHistory([result(10_000), { broken: true }, null])).toEqual([result(10_000)]);
    });

    it('removes duplicates and sorts newest first', () => {
        expect(normalizeHistory([result(100), result(200), result(100)]).map(item => item.endTime)).toEqual([200, 100]);
    });

    it('limits unexpectedly large history stores', () => {
        const oversized = Array.from({ length: 150 }, (_, index) => result(index + 10_000));
        expect(normalizeHistory(oversized)).toHaveLength(MAX_HISTORY_ENTRIES);
        expect(normalizeHistory(oversized)[0].endTime).toBe(10_149);
    });

    it('reads old array storage and survives damaged JSON', () => {
        expect(readHistory({ getItem: () => JSON.stringify([result(100)]) })).toHaveLength(1);
        expect(readHistory({ getItem: () => '{broken' })).toEqual([]);
    });

    it('reports storage write failure without throwing', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(saveHistory([result(100)], { setItem: () => { throw new Error('quota'); } })).toBe(false);
        consoleSpy.mockRestore();
    });
});
