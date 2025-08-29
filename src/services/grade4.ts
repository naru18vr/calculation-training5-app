
import React from 'react';
import type { Topic, Question, Difficulty } from '../types';
import { randInt } from './utils';

const formatDecimal = (num: number): string => {
    return num.toString().replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

// Function to generate addition problems without carry
const generateNoCarryAdd = (digits: number): [number, number] => {
    let a = 0, b = 0;
    for (let i = 0; i < digits; i++) {
        const place = Math.pow(10, i);
        const d1 = randInt(1, 8);
        const d2 = randInt(1, 9 - d1);
        a += d1 * place;
        b += d2 * place;
    }
    return [a, b];
};

// Function to generate subtraction problems without borrow
const generateNoBorrowSub = (digits: number): [number, number] => {
    let a = 0, b = 0;
    for (let i = 0; i < digits; i++) {
        const place = Math.pow(10, i);
        const d2 = randInt(1, 8);
        const d1 = randInt(d2 + 1, 9);
        a += d1 * place;
        b += d2 * place;
    }
    return [a, b];
};


export const generateG4Question = (topic: Topic, difficulty: Difficulty): Omit<Question, 'id'> => {
  let text = '';
  let answer = '';
  let explanation = '';
  let figure: React.ReactNode | undefined = undefined;

  switch (topic.id) {
    case 'g4_addition_subtraction': {
      const isAddition = Math.random() > 0.5;
      if (isAddition) {
        let a: number, b: number;
        if (difficulty === '基礎') {
            [a, b] = generateNoCarryAdd(3);
            explanation = '基礎：繰り上がりのない足し算です。';
        } else if (difficulty === '標準') {
            a = randInt(100, 999);
            b = randInt(100, 999);
            explanation = '標準：繰り上がりのある足し算です。';
        } else { // 発展
            a = randInt(1000, 9999);
            b = randInt(1000, 9999);
            explanation = '発展：桁数が多く、複数回繰り上がる可能性がある足し算です。';
        }
        text = `${a} + ${b} = ?`;
        answer = (a + b).toString();
        explanation += `${a} + ${b} を筆算で計算します。答えは ${answer} です。`;
      } else { // Subtraction
        let large: number, small: number;
        if (difficulty === '基礎') {
            [large, small] = generateNoBorrowSub(3);
            explanation = '基礎：繰り下がりのない引き算です。';
        } else if (difficulty === '標準') {
            const n1 = randInt(100, 999);
            const n2 = randInt(100, 999);
            large = Math.max(n1, n2);
            small = Math.min(n1, n2);
            explanation = '標準：繰り下がりのある引き算です。';
        } else { // 発展
            const n1 = randInt(1000, 9999);
            const n2 = randInt(1000, 9999);
            large = Math.max(n1, n2);
            small = Math.min(n1, n2);
            explanation = '発展：桁数が多く、複数回繰り下がる可能性がある引き算です。';
        }
        text = `${large} - ${small} = ?`;
        answer = (large - small).toString();
        explanation += `${large} - ${small} を筆算で計算します。答えは ${answer} です。`;
      }
      break;
    }
    case 'g4_multiplication': {
        let a: number, b: number;
        if (difficulty === '基礎') {
            const d1 = randInt(1, 4); const d2 = randInt(0, 4);
            const e1 = randInt(1, 4); const e2 = randInt(0, 4);
            a = d1 * 10 + d2;
            b = e1 * 10 + e2;
            if (d2 * e2 > 9 || d1 * e2 + d2 * e1 > 9) { // Simple check to reduce carries
                a = [12, 13, 21, 23, 31, 32][randInt(0,5)];
                b = [11, 12, 21][randInt(0,2)];
            }
            explanation = '基礎：繰り上がりが少ない、またはないかけ算です。';
        } else if (difficulty === '標準') {
            a = randInt(10, 99);
            b = randInt(10, 99);
            explanation = '標準：繰り上がりのあるかけ算です。';
        } else { // 発展
            a = randInt(50, 99);
            b = randInt(50, 99);
            explanation = '発展：数が大きいかけ算です。';
        }
        text = `${a} × ${b} = ?`;
        answer = (a * b).toString();
        explanation += `${a} × ${b} を筆算で計算します。答えは ${answer} です。`;
        break;
    }
    case 'g4_division': {
        if (difficulty === '基礎') { // 余りなし
            const divisor = randInt(2, 9);
            const quotient = randInt(10, Math.floor(99 / divisor));
            const dividend = divisor * quotient;
            text = `${dividend} ÷ ${divisor} = ?`;
            answer = quotient.toString();
            explanation = `基礎：余りのないわり算です。答えは ${answer} です。`;
        } else if (difficulty === '標準') { // 余りあり
            const divisor = randInt(6, 9);
            let dividend: number;
            do {
                dividend = randInt(20, 99);
            } while (dividend % divisor === 0);
            const quotient = Math.floor(dividend / divisor);
            const remainder = dividend % divisor;
            text = `${dividend} ÷ ${divisor} の商と余りを求めなさい。(例: 15r5)`;
            answer = `${quotient}r${remainder}`;
            explanation = `標準：余りのあるわり算です。${dividend} ÷ ${divisor}は、商が${quotient}で余りが${remainder}になります。`;
        } else { // 発展
            const divisor = randInt(4, 9);
            const quotient = randInt(11, Math.floor(199/divisor));
            const dividend = divisor * quotient;
            text = `${dividend} ÷ ${divisor} = ?`;
            answer = quotient.toString();
            explanation = `発展：割られる数が3桁のわり算です。筆算で計算すると答えは ${answer} です。`;
        }
        break;
    }
    case 'g4_fractions_intro': {
        if (difficulty === '基礎') {
            const d = randInt(3, 10);
            const n1 = randInt(1, d - 1);
            let n2 = randInt(1, d - 1, [n1]);
            text = `${n1}/${d} と ${n2}/${d} のうち、大きい方の分数を答えなさい。`;
            answer = n1 > n2 ? `${n1}/${d}` : `${n2}/${d}`;
            explanation = `基礎：分母が同じ分数は、分子が大きい方が大きくなります。したがって、${answer}が大きいです。`;
        } else if (difficulty === '標準') {
            const d1 = 2; const n1 = 1;
            const d2 = 4; const n2 = randInt(1,3, [2]);
            text = `${n1}/${d1} と ${n2}/${d2} のうち、大きい方の分数を答えなさい。`;
            answer = (n1/d1 > n2/d2) ? `${n1}/${d1}` : `${n2}/${d2}`;
            explanation = `標準：分母が違うので通分して比べます。1/2は2/4なので、${answer}の方が大きいです。`;
        } else { // 発展
            const dens = [[6, 12], [9, 12], [8, 6]];
            const [d1, d2] = dens[randInt(0, dens.length - 1)];
            const n1 = randInt(1, d1 - 1);
            const n2 = randInt(1, d2 - 1);
            text = `${n1}/${d1} と ${n2}/${d2} のうち、大きい方の分数を答えなさい。`;
            answer = (n1/d1 > n2/d2) ? `${n1}/${d1}` : `${n2}/${d2}`;
            explanation = `発展：分母が違うので通分して比べます。答えは${answer}です。`;
        }
        break;
    }
    case 'g4_rounding': {
        if (difficulty === '基礎') {
            const num = randInt(100, 999);
            text = `${num}を十の位までの概数（一の位を四捨五入）にしなさい。`;
            answer = (Math.round(num / 10) * 10).toString();
            explanation = `${num}の一の位は${num % 10}です。これを四捨五入すると、答えは${answer}になります。`;
        } else if (difficulty === '標準') {
            if (Math.random() > 0.5) {
                const num = randInt(1000, 9999);
                text = `${num}を百の位までの概数（十の位を四捨五入）にしなさい。`;
                answer = (Math.round(num / 100) * 100).toString();
                explanation = `百の位までの概数なので、十の位を四捨五入します。答えは${answer}です。`;
            } else {
                const num = randInt(10000, 99999);
                text = `${num}を千の位までの概数（百の位を四捨五入）にしなさい。`;
                answer = (Math.round(num / 1000) * 1000).toString();
                explanation = `千の位までの概数なので、百の位を四捨五入します。答えは${answer}です。`;
            }
        } else { // 発展
            const a = randInt(100, 999);
            const b = randInt(100, 999);
            text = `${a} + ${b} の計算を、百の位までの概数にしてから答えなさい。`;
            const roundedA = Math.round(a / 100) * 100;
            const roundedB = Math.round(b / 100) * 100;
            answer = (roundedA + roundedB).toString();
            explanation = `発展：まずそれぞれの数を百の位までの概数にします。${a}は約${roundedA}、${b}は約${roundedB}になります。${roundedA} + ${roundedB} = ${answer}。`;
        }
        break;
    }
    case 'g4_unit_conversion': {
        if (difficulty === '基礎') {
            const toCm = Math.random() > 0.5;
            if (toCm) {
                const m = randInt(2, 9);
                text = `${m}m は何cmですか？`;
                answer = (m * 100).toString();
                explanation = `1mは100cmなので、${m}mは${answer}cmです。`;
            } else {
                const cm = randInt(2, 9) * 100 + randInt(1, 9) * 10;
                text = `${cm}cm は何m何cmですか？(例: 2,50)`;
                answer = `${Math.floor(cm/100)},${cm%100}`;
                explanation = `100cmが1mです。${cm}cmは${Math.floor(cm/100)}m${cm%100}cmです。`;
            }
        } else if (difficulty === '標準') {
            const conversions = [ { from: 'kg', to: 'g', factor: 1000 }, { from: 'L', to: 'mL', factor: 1000 } ];
            const conv = conversions[randInt(0, 1)];
            const val = randInt(1, 4) * 1000 + randInt(1,9) * 100;
            text = `${val}${conv.to} は何${conv.from}何${conv.to}ですか？(例: 1,500)`;
            answer = `${Math.floor(val/conv.factor)},${val%conv.factor}`;
            explanation = `1${conv.from}は${conv.factor}${conv.to}です。答えは${Math.floor(val/conv.factor)}${conv.from}${val%conv.factor}${conv.to}です。`;
        } else { // 発展
             const conversions = [ { from: 'm', to: 'cm', factor: 100 }, { from: 'kg', to: 'g', factor: 1000 }];
             const conv = conversions[randInt(0, 1)];
             const val = randInt(11, 49)/10;
             text = `${val}${conv.from} は何${conv.to}ですか？`;
             answer = (val * conv.factor).toString();
             explanation = `発展：小数でも同じように計算します。1${conv.from}は${conv.factor}${conv.to}なので、${val}×${conv.factor}=${answer}${conv.to}。`;
        }
        break;
    }
    case 'g4_rectangle_area': {
        let width: number, height: number, widthUnit: string, heightUnit: string;
        if (difficulty === '基礎') {
            width = randInt(2, 12); height = randInt(2, 12, [width]);
            widthUnit = 'cm'; heightUnit = 'cm';
            text = `たて${height}${heightUnit}, よこ${width}${widthUnit}の長方形の面積を求めなさい。(単位はcm²)`;
            answer = (width * height).toString();
            explanation = `長方形の面積 = たて × よこ。 ${height} × ${width} = ${answer}cm²。`;
        } else if (difficulty === '標準') {
            if (Math.random() > 0.5) {
                width = randInt(10, 25); height = randInt(5, 15);
                widthUnit = 'cm'; heightUnit = 'cm';
                text = `たて${height}${heightUnit}, よこ${width}${widthUnit}の長方形の面積を求めなさい。(単位はcm²)`;
                answer = (width * height).toString();
                explanation = `長方形の面積 = たて × よこ。 ${height} × ${width} = ${answer}cm²。`;
            } else {
                width = randInt(15, 50)/10; height = randInt(2, 10);
                widthUnit = 'm'; heightUnit = 'm';
                text = `たて${height}${heightUnit}, よこ${width}${widthUnit}の長方形の面積を求めなさい。(単位はm²)`;
                answer = formatDecimal(width * height);
                explanation = `小数でも同様に計算します。 ${height} × ${width} = ${answer}m²。`;
            }
        } else { // 発展
            width = randInt(2, 5); height = randInt(200, 500);
            widthUnit = 'm'; heightUnit = 'cm';
            text = `たて${height}${heightUnit}, よこ${width}${widthUnit}の長方形の面積を求めなさい。(単位はm²)`;
            answer = formatDecimal(width * (height/100));
            explanation = `発展：単位を揃えてから計算します。${height}cmは${height/100}mです。面積 = ${height/100}m × ${width}m = ${answer}m²。`;
        }

        const svgWidth = 240, svgHeight = 200;
        const scale = 140 / Math.max(width, height);
        const rectWidth = width * scale, rectHeight = height * scale;
        const xOffset = (svgWidth - rectWidth) / 2, yOffset = (svgHeight - rectHeight) / 2;
        
        figure = React.createElement('svg', { width: svgWidth, height: svgHeight, viewBox: `0 0 ${svgWidth} ${svgHeight}`, style: { pointerEvents: 'none' } },
            React.createElement('rect', { x: xOffset, y: yOffset, width: rectWidth, height: rectHeight, fill: "rgba(80, 160, 240, 0.3)", stroke: "#334155", strokeWidth: "2" }),
            React.createElement('text', { x: xOffset + rectWidth / 2, y: yOffset + rectHeight + 20, fontSize: "16", textAnchor: "middle"}, `${width}${widthUnit}`),
            React.createElement('text', { x: xOffset - 10, y: yOffset + rectHeight / 2, fontSize: "16", textAnchor: "end", dominantBaseline: "middle"}, `${height}${heightUnit}`)
        );
        break;
    }
    default:
        return { text: `「${topic.name}」の問題は準備中です。`, answer: '', explanation: '' };
  }
  return { text, answer, explanation, figure };
};
