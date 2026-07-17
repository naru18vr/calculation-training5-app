import { describe, expect, it } from 'vitest';
import type { QuizResult } from '../types';
import { createHistoryCsv } from './reportService';

describe('report service', () => {
    it('creates a spreadsheet-friendly CSV row', () => {
        const history: QuizResult[] = [{ studentId: 'grade5', grade: '小5', topic: { id: 'g5_average', name: '平均' }, difficulty: '標準', startTime: 0, endTime: 60000, results: [{ question: { id: 0, text: '問題', answer: '2', explanation: '解説' }, attempts: 0, isCorrect: true, isSkipped: false }] }];
        const csv = createHistoryCsv(history);
        expect(csv).toContain('"正答率(%)"');
        expect(csv).toContain('"平均","標準","1","1","100","60"');
    });
});
