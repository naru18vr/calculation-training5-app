import { describe, expect, it } from 'vitest';
import { isAnswerCorrect, normalizeAnswer } from './answerService';

describe('answer service', () => {
    it('accepts full-width input and common units', () => {
        expect(isAnswerCorrect('１２cm', '12')).toBe(true);
        expect(normalizeAnswer('ＳＱＲＴ ９')).toBe('√9');
    });

    it('accepts equivalent fractions and decimals', () => {
        expect(isAnswerCorrect('2/4', '1/2')).toBe(true);
        expect(isAnswerCorrect('0.5', '1/2')).toBe(true);
    });

    it('does not accept a different value', () => {
        expect(isAnswerCorrect('2/3', '1/2')).toBe(false);
    });
});
