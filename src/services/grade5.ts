
import React from 'react';
import type { Topic, Question, Difficulty } from '../types';
import { randInt, gcd } from './utils';

const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
const lcm3 = (a: number, b: number, c: number): number => lcm(lcm(a,b), c);
const gcd3 = (a: number, b: number, c: number): number => gcd(gcd(a,b), c);

const simplifyFraction = (num: number, den: number): string => {
    if (num === 0) return '0';
    if (den === 1) return num.toString();
    const common = gcd(Math.abs(num), Math.abs(den));
    const sNum = num / common;
    const sDen = den / common;
    if (sDen === 1) return sNum.toString();
    return `${sNum}/${sDen}`;
};

const formatDecimal = (num: number): string => {
    return num.toString().replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export const generateG5Question = (topic: Topic, difficulty: Difficulty): Omit<Question, 'id'> => {
  let text = '';
  let answer = '';
  let explanation = '';
  let figure: React.ReactNode | undefined = undefined;

  switch (topic.id) {
    case 'g5_decimals_multiplication': {
        let a: number, b: number;
        if (difficulty === '基礎') {
            a = randInt(11, 49) / 10; // 1.1 to 4.9
            b = randInt(2, 9);
            explanation = `基礎：小数×整数の計算です。`;
        } else if (difficulty === '標準') {
            a = randInt(1, 99) / 10;
            b = randInt(1, 9) / 10;
            explanation = `標準：小数×小数の計算です。`;
        } else { // 発展
            a = randInt(101, 999) / 100; // 1.01 to 9.99
            b = randInt(1, 99) / 10; // 0.1 to 9.9
            explanation = `発展：桁数の大きい小数のかけ算です。`;
        }
        text = `${a} × ${b} = ?`;
        const result = parseFloat((a * b).toPrecision(15));
        answer = formatDecimal(result);
        explanation += `整数と同じように計算し、小数点の位置を調整します。答えは ${answer} です。`;
        break;
    }
    case 'g5_decimals_division': {
        if (difficulty === '基礎') { // 整数÷小数
            const divisor = randInt(2, 9) / 10; // 0.2 to 0.9
            const quotient = randInt(2, 20);
            const dividend = parseFloat((divisor * quotient).toPrecision(15));
            text = `${dividend} ÷ ${divisor} = ?`;
            answer = quotient.toString();
            explanation = `基礎：整数÷小数の計算です。小数点の位置をずらして整数で計算します。答えは ${answer} です。`;
        } else if (difficulty === '標準') { // 小数÷整数
            const divisor = randInt(2, 9);
            const quotient = randInt(2, 20) / 10; // 0.2 to 2.0
            const dividend = parseFloat((divisor * quotient).toPrecision(15));
            text = `${dividend} ÷ ${divisor} = ?`;
            answer = formatDecimal(quotient);
            explanation = `標準：小数÷整数の計算です。答えは ${answer} です。`;
        } else { // 発展: 小数÷小数
            const divisor = randInt(2, 50) / 100; // 0.02 to 0.5
            const quotient = randInt(2, 20);
            const dividend = parseFloat((divisor * quotient).toPrecision(15));
            text = `${dividend} ÷ ${divisor} = ?`;
            answer = quotient.toString();
            explanation = `発展：小数÷小数の計算です。小数点の位置をずらして整数で計算します。答えは ${answer} です。`;
        }
        break;
    }
    case 'g5_fractions_simplify': {
        let common: number, num: number, den: number;
        if (difficulty === '基礎') {
            common = randInt(2, 5);
            num = randInt(1, 5);
            den = randInt(num + 1, 9);
            explanation = `基礎：分子と分母を最大公約数である${common}で割ります。`;
        } else if (difficulty === '標準') {
            common = randInt(2, 9);
            num = randInt(2, 9);
            den = randInt(num + 1, 15);
            explanation = `標準：分子と分母の最大公約数を見つけて割ります。`;
        } else { // 発展
            common = randInt(10, 25);
            num = randInt(2, 9);
            den = randInt(num + 1, 12);
            explanation = `発展：数が大きいですが、同じように最大公約数で割ります。`;
        }
        text = `${num*common}/${den*common} を約分しなさい。`;
        answer = `${num}/${den}`;
        explanation += `答えは ${answer} です。`;
        break;
    }
    case 'g5_fractions_common_denominator': {
        let d1: number, d2: number;
        if (difficulty === '基礎') {
            d1 = randInt(2, 5);
            d2 = randInt(3, 6, [d1]);
        } else if (difficulty === '標準') {
            d1 = randInt(4, 9);
            d2 = randInt(6, 12, [d1]);
        } else { // 発展
            const base1 = randInt(2,4);
            const base2 = randInt(2,4);
            const base3 = randInt(2,4);
            d1 = base1 * base2 * randInt(1,2);
            d2 = base2 * base3 * randInt(1,2);
            if (d1 === d2) d2 += base1;
        }
        const n1 = randInt(1, d1-1);
        const n2 = randInt(1, d2-1);
        text = `${n1}/${d1} と ${n2}/${d2} を通分しなさい。(例: 3/4,5/6)`;
        const commonDen = lcm(d1, d2);
        answer = `${n1*(commonDen/d1)}/${commonDen},${n2*(commonDen/d2)}/${commonDen}`;
        explanation = `${d1}と${d2}の最小公倍数は${commonDen}です。それぞれ分母が${commonDen}になるように分子を調整します。答えは ${answer} です。`;
        break;
    }
    case 'g5_fractions_addition': {
        let d: number, n1: number, n2: number;
        if (difficulty === '基礎') {
            d = randInt(3, 9);
        } else if (difficulty === '標準') {
            d = randInt(10, 20);
        } else { // 発展
            d = randInt(3, 9);
            const whole1 = randInt(1, 3);
            n1 = randInt(1, d-1);
            n2 = randInt(1, d-1, [d-n1]);
            const num = (whole1 * d + n1) + n2;
            text = `${whole1}と${n1}/${d} + ${n2}/${d} = ? (仮分数で答えなさい)`;
            answer = simplifyFraction(num, d);
            explanation = `発展：帯分数を仮分数に直して計算します。答えは ${answer} です。`;
            break;
        }
        n1 = randInt(1, d - 1);
        n2 = randInt(1, d - 1, [d - n1]);
        text = `${n1}/${d} + ${n2}/${d} = ? (仮分数で答えなさい)`;
        const num = n1 + n2;
        answer = simplifyFraction(num, d);
        explanation = `分母が同じなので分子を足します。${n1}+${n2}=${num}。${num}/${d}を約分して ${answer}。`;
        break;
    }
    case 'g5_fractions_subtraction': {
        let d: number, n1: number, n2: number;
        if (difficulty === '基礎') {
            d = randInt(3, 9);
        } else if (difficulty === '標準') {
            d = randInt(10, 20);
        } else { // 発展
            d = randInt(3, 9);
            const whole1 = randInt(2, 4);
            n1 = randInt(1, d-1);
            n2 = randInt(1, d-1);
            const num = (whole1 * d + n1) - n2;
            text = `${whole1}と${n1}/${d} - ${n2}/${d} = ? (仮分数で答えなさい)`;
            answer = simplifyFraction(num, d);
            explanation = `発展：帯分数を仮分数に直して計算します。答えは ${answer} です。`;
            break;
        }
        n1 = randInt(1, d - 1);
        n2 = randInt(1, d - 1);
        const bigN = Math.max(n1, n2);
        const smallN = Math.min(n1, n2);
        text = `${bigN}/${d} - ${smallN}/${d} = ? (仮分数で答えなさい)`;
        const num = bigN - smallN;
        answer = simplifyFraction(num, d);
        explanation = `分母が同じなので分子を引きます。${bigN}-${smallN}=${num}。${num}/${d}を約分して ${answer}。`;
        break;
    }
    case 'g5_percentages': {
        if (difficulty === '基礎') {
            const total = randInt(1, 9) * 10;
            const percentage = [10, 20, 25, 50, 75][randInt(0,4)];
            text = `${total} の ${percentage}% はいくらですか？`;
            answer = formatDecimal(total * (percentage / 100));
            explanation = `基礎：${total}に割合(${percentage}/100)をかけると計算できます。${total} × ${percentage/100} = ${answer}。`;
        } else if (difficulty === '標準') {
            const total = randInt(1, 49) / 10;
            const percentage = randInt(1, 9) * 10;
            text = `${total} の ${percentage}% はいくらですか？`;
            answer = formatDecimal(total * (percentage / 100));
            explanation = `標準：小数でも同じように計算します。${total} × ${percentage/100} = ${answer}。`;
        } else { // 発展
            const percentage = [10, 20, 25, 50][randInt(0,3)];
            const part = randInt(2, 9);
            const total = part * (100 / percentage);
            text = `${part} は ${total} の何%ですか？`;
            answer = percentage.toString();
            explanation = `発展：(部分 ÷ 全体) × 100 で百分率を求めます。(${part} ÷ ${total}) × 100 = ${answer}%。`;
        }
        break;
    }
    case 'g5_common_multiples': {
        let n1: number, n2: number, n3: number;
        if (difficulty === '基礎') {
            n1 = randInt(3, 9);
            n2 = randInt(3, 9, [n1]);
            text = `${n1}と${n2}の最小公倍数は？`;
            answer = lcm(n1,n2).toString();
            explanation = `基礎：${n1}と${n2}の倍数をリストアップし、最初の共通のものを探します。答えは${answer}です。`;
        } else if (difficulty === '標準') {
            n1 = randInt(10, 25);
            n2 = randInt(10, 25, [n1]);
            text = `${n1}と${n2}の最小公倍数は？`;
            answer = lcm(n1,n2).toString();
            explanation = `標準：数が大きくても同じように計算します。素因数分解を使うと便利です。答えは${answer}です。`;
        } else { // 発展
            n1 = randInt(4, 9);
            n2 = randInt(4, 9, [n1]);
            n3 = randInt(4, 9, [n1, n2]);
            text = `${n1}, ${n2}, ${n3}の最小公倍数は？`;
            answer = lcm3(n1, n2, n3).toString();
            explanation = `発展：3つの数の最小公倍数を求めます。答えは${answer}です。`;
        }
        break;
    }
     case 'g5_common_divisors': {
        let n1: number, n2: number, n3: number;
        if (difficulty === '基礎') {
            const common = randInt(2, 5);
            n1 = common * randInt(2, 5);
            n2 = common * randInt(2, 5, [n1/common]);
            text = `${n1}と${n2}の最大公約数は？`;
            answer = gcd(n1,n2).toString();
            explanation = `基礎：${n1}と${n2}の約数をリストアップし、最大のものを探します。答えは${answer}です。`;
        } else if (difficulty === '標準') {
            const common = randInt(3, 8);
            n1 = common * randInt(2, 8);
            n2 = common * randInt(2, 8, [n1/common]);
            text = `${n1}と${n2}の最大公約数は？`;
            answer = gcd(n1,n2).toString();
            explanation = `標準：数が大きくても同じように計算します。素因数分解を使うと便利です。答えは${answer}です。`;
        } else { // 発展
            const common = randInt(2, 6);
            n1 = common * randInt(2, 4);
            n2 = common * randInt(2, 4, [n1/common]);
            n3 = common * randInt(2, 4, [n1/common, n2/common]);
            text = `${n1}, ${n2}, ${n3}の最大公約数は？`;
            answer = gcd3(n1, n2, n3).toString();
            explanation = `発展：3つの数の最大公約数を求めます。答えは${answer}です。`;
        }
        break;
    }
    case 'g5_triangle_area': {
        let base: number, height: number;
        let result: number;
        if (difficulty === '基礎') {
            base = randInt(4, 20);
            height = randInt(4, 20);
            result = (base * height) / 2;
            answer = formatDecimal(result);
            explanation = `基礎：三角形の面積 = 底辺 × 高さ ÷ 2。 ${base} × ${height} ÷ 2 = ${answer}cm²。`;
        } else if (difficulty === '標準') {
            base = randInt(5, 50) / 10; // 0.5 to 5.0
            height = randInt(4, 20);
            result = (base * height) / 2;
            answer = formatDecimal(result);
            explanation = `標準：底辺が小数でも同じように計算します。 ${base} × ${height} ÷ 2 = ${answer}cm²。`;
        } else { // 発展
            const rectW = randInt(10, 20);
            const rectH = randInt(10, 20);
            base = randInt(5, rectW - 2);
            height = rectH;
            text = `たて${rectH}cm, よこ${rectW}cmの長方形の中に、図のように三角形があります。この三角形の面積を求めなさい。`;
            answer = formatDecimal((base * height) / 2);
            explanation = `発展：図から三角形の底辺と高さを読み取ります。底辺=${base}cm, 高さ=${height}cm。面積は ${base}×${height}÷2 = ${answer}cm²。`;
            
            const svgWidth = 240, svgHeight = 180;
            const scale = 140 / Math.max(rectW, rectH);
            const rW = rectW * scale, rH = rectH * scale;
            const b = base * scale;
            const xOffset = (svgWidth - rW) / 2, yOffset = (svgHeight - rH) / 2;
            const split = randInt(1, b-1);
            figure = React.createElement('svg', {width: svgWidth, height: svgHeight, viewBox: `0 0 ${svgWidth} ${svgHeight}`, style: { pointerEvents: 'none' }}, 
                React.createElement('rect', {x:xOffset, y:yOffset, width:rW, height:rH, fill:"none", stroke:"#9ca3af"}),
                React.createElement('polygon', { points: `${xOffset},${yOffset+rH} ${xOffset+b},${yOffset+rH} ${xOffset+split},${yOffset}`, fill: "rgba(80, 160, 240, 0.3)", stroke: "#334155", strokeWidth: "2" }),
                React.createElement('text', {x: xOffset+b/2, y: yOffset+rH+18, fontSize: "14", textAnchor:"middle"}, `${base}cm`),
                React.createElement('text', {x: xOffset+rW+5, y: yOffset+rH/2, fontSize: "14", dominantBaseline:"middle"}, `${rectH}cm`)
            );
            return {text, answer, explanation, figure};
        }

        text = `図の三角形の面積を求めなさい。(底辺${base}cm, 高さ${height}cm)`;
        
        const isRightAngled = Math.random() < 0.5;
        const svgWidth = 240;
        const svgHeight = 180;
        const maxDim = Math.max(base, height);
        const scale = 140 / maxDim;
        const basePx = base * scale;
        const heightPx = height * scale;
        const xOffset = (svgWidth - basePx) / 2;
        const yOffset = (svgHeight - heightPx) / 2;

        if (isRightAngled) {
            const points = `${xOffset},${yOffset} ${xOffset},${yOffset + heightPx} ${xOffset + basePx},${yOffset + heightPx}`;
            figure = React.createElement('svg', { width: svgWidth, height: svgHeight, viewBox: `0 0 ${svgWidth} ${svgHeight}`, style: { pointerEvents: 'none' } },
                React.createElement('polygon', { points, fill: "rgba(80, 160, 240, 0.3)", stroke: "#334155", strokeWidth: "2" }),
                React.createElement('text', { x: xOffset + basePx / 2, y: yOffset + heightPx + 20, fontSize: "16", textAnchor: "middle" }, `${base}cm`),
                React.createElement('text', { x: xOffset - 10, y: yOffset + heightPx / 2, fontSize: "16", textAnchor: "end", dominantBaseline: "middle" }, `${height}cm`),
                React.createElement('rect', { x: xOffset, y: yOffset + heightPx - 10, width: "10", height: "10", fill: "none", stroke: "#334155", strokeWidth: "1.5" })
            );
        } else {
            const skew = randInt(basePx * 0.2, basePx * 0.8);
            const points = `${xOffset},${yOffset + heightPx} ${xOffset + basePx},${yOffset + heightPx} ${xOffset + skew},${yOffset}`;
             figure = React.createElement('svg', { width: svgWidth, height: svgHeight, viewBox: `0 0 ${svgWidth} ${svgHeight}`, style: { pointerEvents: 'none' } },
                React.createElement('polygon', { points, fill: "rgba(80, 160, 240, 0.3)", stroke: "#334155", strokeWidth: "2" }),
                React.createElement('line', { x1: xOffset + skew, y1: yOffset, x2: xOffset + skew, y2: yOffset + heightPx, stroke: "#f59e0b", strokeWidth: "2", strokeDasharray: "4 2" }),
                React.createElement('text', { x: xOffset + basePx / 2, y: yOffset + heightPx + 20, fontSize: "16", textAnchor: "middle" }, `${base}cm`),
                React.createElement('text', { x: xOffset + skew + 5, y: yOffset + heightPx / 2, fontSize: "16", fill: "#f59e0b" }, `${height}cm`),
                React.createElement('rect', { x: xOffset + skew - 5, y: yOffset + heightPx - 10, width: "10", height: "10", fill: "none", stroke: "#f59e0b", strokeWidth: "1.5" })
            );
        }
        break;
    }
    default:
      return { text: `「${topic.name}」の問題は準備中です。`, answer: '', explanation: '' };
  }
  return { text, answer, explanation, figure };
};
