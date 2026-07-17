const fullWidthMap: Record<string, string> = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4', '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
    'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f', 'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j', 'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't', 'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y', 'ｚ': 'z',
    'Ａ': 'a', 'Ｂ': 'b', 'Ｃ': 'c', 'Ｄ': 'd', 'Ｅ': 'e', 'Ｆ': 'f', 'Ｇ': 'g', 'Ｈ': 'h', 'Ｉ': 'i', 'Ｊ': 'j', 'Ｋ': 'k', 'Ｌ': 'l', 'Ｍ': 'm', 'Ｎ': 'n', 'Ｏ': 'o', 'Ｐ': 'p', 'Ｑ': 'q', 'Ｒ': 'r', 'Ｓ': 's', 'Ｔ': 't', 'Ｕ': 'u', 'Ｖ': 'v', 'Ｗ': 'w', 'Ｘ': 'x', 'Ｙ': 'y', 'Ｚ': 'z',
    '（': '(', '）': ')', '＋': '+', '－': '-', '＊': '*', '＝': '=', '，': ',', '．': '.', '／': '/', '：': ':', '＾': '^', '√': '√', 'π': 'π', '～': '-',
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

    if (normalized.includes('=')) {
        const parts = normalized.split('=');
        if (parts.length === 2 && !/^[xy]=/.test(normalized)) {
            return parts.map(part => part.split('').sort().join('')).sort().join('=');
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

export const isAnswerCorrect = (input: string, expected: string): boolean => {
    const normalizedInput = normalizeAnswer(input);
    const normalizedExpected = normalizeAnswer(expected);
    if (normalizedInput === normalizedExpected) return true;

    const inputNumber = parseRational(normalizedInput);
    const expectedNumber = parseRational(normalizedExpected);
    return inputNumber !== null && expectedNumber !== null && Math.abs(inputNumber - expectedNumber) < 1e-10;
};
