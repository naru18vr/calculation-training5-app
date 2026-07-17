import { describe, expect, it } from 'vitest';
import type { QuizResult } from '../types';
import { calculateStreak } from './useStudentProfile';

const session = (year: number, month: number, day: number): QuizResult => ({
    studentId: 'grade5', grade: '小5', topic: { id: 'g5_average', name: '平均' }, difficulty: '標準', results: [],
    startTime: new Date(year, month - 1, day, 12).getTime() - 1000,
    endTime: new Date(year, month - 1, day, 12).getTime(),
});

describe('study streak', () => {
    it('counts consecutive local calendar days including yesterday', () => {
        const history = [session(2026, 3, 9), session(2026, 3, 8), session(2026, 3, 7)];
        expect(calculateStreak(history, new Date(2026, 2, 9, 0, 1))).toBe(3);
        expect(calculateStreak(history.slice(1), new Date(2026, 2, 9, 23, 59))).toBe(2);
    });

    it('stops at a missed day and ignores future timestamps', () => {
        const history = [session(2026, 7, 18), session(2026, 7, 16), session(2026, 7, 20)];
        expect(calculateStreak(history, new Date(2026, 6, 18, 12))).toBe(1);
    });
});
