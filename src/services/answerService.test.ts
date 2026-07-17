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

    it('accepts common math symbols and superscript input', () => {
        expect(isAnswerCorrect('x²＋5x＋6', 'x^2+5x+6')).toBe(true);
        expect(isAnswerCorrect('3×4', '3*4')).toBe(true);
        expect(isAnswerCorrect('12÷3', '12/3')).toBe(true);
    });

    it('accepts solutions and simultaneous answers in either order', () => {
        expect(isAnswerCorrect('x=3,2', 'x=2,3')).toBe(true);
        expect(isAnswerCorrect('y=3,x=2', 'x=2,y=3')).toBe(true);
        expect(isAnswerCorrect('d=a', 'a=d')).toBe(true);
    });
});
