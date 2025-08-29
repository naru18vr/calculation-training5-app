
// Helper to generate a random integer within a range, with optional exclusions.
export const randInt = (min: number, max: number, exclude: number[] = []): number => {
    let n;
    do {
        n = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (exclude.includes(n));
    return n;
};

export const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export const primeFactorize = (num: number): Record<number, number> => {
    const factors: Record<number, number> = {};
    let n = num;
    let d = 2;
    while (d * d <= n) {
        while (n % d === 0) {
            factors[d] = (factors[d] || 0) + 1;
            n /= d;
        }
        d++;
    }
    if (n > 1) {
        factors[n] = (factors[n] || 0) + 1;
    }
    return factors;
};

export const formatNum = (n: number) => n < 0 ? `(${n})` : `${n}`;