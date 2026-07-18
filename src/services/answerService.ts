const fullWidthMap: Record<string, string> = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4', '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
    'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f', 'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j', 'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't', 'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y', 'ｚ': 'z',
    'Ａ': 'a', 'Ｂ': 'b', 'Ｃ': 'c', 'Ｄ': 'd', 'Ｅ': 'e', 'Ｆ': 'f', 'Ｇ': 'g', 'Ｈ': 'h', 'Ｉ': 'i', 'Ｊ': 'j', 'Ｋ': 'k', 'Ｌ': 'l', 'Ｍ': 'm', 'Ｎ': 'n', 'Ｏ': 'o', 'Ｐ': 'p', 'Ｑ': 'q', 'Ｒ': 'r', 'Ｓ': 's', 'Ｔ': 't', 'Ｕ': 'u', 'Ｖ': 'v', 'Ｗ': 'w', 'Ｘ': 'x', 'Ｙ': 'y', 'Ｚ': 'z',
    '（': '(', '）': ')', '＋': '+', '－': '-', '＊': '*', '＝': '=', '，': ',', '．': '.', '／': '/', '：': ':', '＾': '^', '√': '√', 'π': 'π', '～': '-',
    '−': '-', '×': '*', '÷': '/', '、': ',', '²': '^2', '³': '^3', '°': '',
};

const sortValues = (values: string[]): string[] => [...values].sort((first, second) => {
    const firstValue = parseRational(first);
    const secondValue = parseRational(second);
    if (firstValue !== null && secondValue !== null) return firstValue - secondValue;
    return first.localeCompare(second);
});

const normalizeSolutionOrder = (value: string): string => {
    const repeatedVariable = value.match(/^([a-z])=([^,]+(?:,[^=,]+)+)$/);
    if (repeatedVariable) return `${repeatedVariable[1]}=${sortValues(repeatedVariable[2].split(',')).join(',')}`;

    const assignments = value.split(',');
    if (assignments.length > 1 && assignments.every(item => /^[a-z]=[^=,]+$/.test(item))) {
        return assignments.sort((first, second) => first[0].localeCompare(second[0])).join(',');
    }
    return value;
};

export const normalizeAnswer = (input: string): string => {
    let normalized = input.split('').map(char => fullWidthMap[char] || char).join('')
        .toLowerCase().replace(/\s+/g, '').replace(/sqrt/g, '√').replace(/・/g, '*').replace(/角/g, '');

    normalized = normalized
        .replace(/(\d+(?:\.\d+)?)\s*(?:m|メートル)\s*(\d+(?:\.\d+)?)\s*(?:cm|センチ)?/g, '$1,$2')
        .replace(/(\d+(?:\.\d+)?)\s*(?:kg|キログラム)\s*(\d+(?:\.\d+)?)\s*(?:g|グラム)?/g, '$1,$2')
        .replace(/(\d+(?:\.\d+)?)\s*(?:l|リットル)\s*(\d+(?:\.\d+)?)\s*(?:ml|ミリリットル)?/g, '$1,$2')
        .replace(/(\d+)\s*(?:分)\s*(\d+)\s*(?:秒)?/g, '$1,$2')
        .replace(/あまり/g, 'r');

    if (!normalized.includes(',')) {
        const units = ['km/時', 'cm²', 'cm³', 'm²', '時間', 'km', 'cm', 'm', 'kg', 'g', 'l', 'ml', '分', '秒', '度', '円', '個', '人', '%'];
        const unit = units.find(item => normalized.endsWith(item));
        if (unit) normalized = normalized.slice(0, -unit.length);
    }

    if (normalized.includes('*') && /^[0-9^*]+$/.test(normalized)) {
        return normalized.split('*').sort().join('*');
    }
    const factors = normalized.match(/\([^)]+\)/g);
    if (factors && factors.length > 1 && factors.join('') === normalized) return factors.sort().join('');

    normalized = normalizeSolutionOrder(normalized);

    if (normalized.includes('=')) {
        const parts = normalized.split('=');
        if (parts.length === 2 && !/^[xy]=/.test(normalized)) {
            return parts.sort().join('=');
        }
    }
    return normalized;
};

const parseRational = (value: string): number | null => {
    if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
    const match = value.match(/^(-?\d+)\/(-?\d+)$/);
    if (!match || Number(match[2]) === 0) return null;
    return Number(match[1]) / Number(match[2]);
};

const parseRadical = (value: string): number | null => {
    const match = value.match(/^(-?\d*)√(\d+)(?:\/(-?\d+))?$/);
    if (!match) return null;
    const coefficient = match[1] === '' ? 1 : match[1] === '-' ? -1 : Number(match[1]);
    const denominator = match[3] === undefined ? 1 : Number(match[3]);
    if (denominator === 0) return null;
    return coefficient * Math.sqrt(Number(match[2])) / denominator;
};

const parsePolynomial = (value: string): Map<number, number> | null => {
    if (!value.includes('x') || !/^[0-9x^+\-]+$/.test(value)) return null;
    const terms = value.replace(/-/g, '+-').split('+').filter(Boolean);
    const result = new Map<number, number>();
    for (const term of terms) {
        const variable = term.match(/^([+-]?\d*)x(?:\^(\d+))?$/);
        const constant = term.match(/^[+-]?\d+$/);
        if (!variable && !constant) return null;
        const degree = variable ? Number(variable[2] ?? 1) : 0;
        const rawCoefficient = variable ? variable[1] : term;
        const coefficient = rawCoefficient === '' || rawCoefficient === '+' ? 1 : rawCoefficient === '-' ? -1 : Number(rawCoefficient);
        result.set(degree, (result.get(degree) ?? 0) + coefficient);
    }
    return result;
};

const polynomialsEqual = (first: Map<number, number>, second: Map<number, number>): boolean => {
    const degrees = new Set([...first.keys(), ...second.keys()]);
    return [...degrees].every(degree => (first.get(degree) ?? 0) === (second.get(degree) ?? 0));
};

export const isAnswerCorrect = (input: string, expected: string): boolean => {
    const normalizedInput = normalizeAnswer(input);
    const normalizedExpected = normalizeAnswer(expected);
    if (normalizedInput === normalizedExpected) return true;

    const inputNumber = parseRational(normalizedInput);
    const expectedNumber = parseRational(normalizedExpected);
    if (inputNumber !== null && expectedNumber !== null) return Math.abs(inputNumber - expectedNumber) < 1e-10;

    const inputRadical = parseRadical(normalizedInput);
    const expectedRadical = parseRadical(normalizedExpected);
    if (inputRadical !== null && expectedRadical !== null) return Math.abs(inputRadical - expectedRadical) < 1e-10;

    const inputPolynomial = parsePolynomial(normalizedInput);
    const expectedPolynomial = parsePolynomial(normalizedExpected);
    return inputPolynomial !== null && expectedPolynomial !== null && polynomialsEqual(inputPolynomial, expectedPolynomial);
};
