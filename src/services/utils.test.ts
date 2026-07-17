import { describe, expect, it, vi } from 'vitest';
import { shuffle, splitMathText } from './utils';

describe('utility functions', () => {
    it('shuffles without changing the source array', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const source = [1, 2, 3, 4];
        const result = shuffle(source);
        expect(source).toEqual([1, 2, 3, 4]);
        expect([...result].sort()).toEqual(source);
        expect(result).not.toEqual(source);
        vi.restoreAllMocks();
    });

    it('separates powers from untrusted problem text without HTML', () => {
        expect(splitMathText('x^2 + y^-3 <img>')).toEqual([
            { text: 'x', superscript: false },
            { text: '2', superscript: true },
            { text: ' + y', superscript: false },
            { text: '-3', superscript: true },
            { text: ' <img>', superscript: false },
        ]);
    });
});
