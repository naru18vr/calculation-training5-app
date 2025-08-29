
import React from 'react';
import type { Topic, Question, Difficulty } from '../types';
import { randInt, formatNum, primeFactorize, gcd } from './utils';

const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

// Helper for fraction simplification
const simplifyFraction = (num: number, den: number): [number, number] => {
    if (den < 0) { // Keep denominator positive
        num = -num;
        den = -den;
    }
    const common = gcd(Math.abs(num), Math.abs(den));
    return [num / common, den / common];
};


export const generateM1Question = (topic: Topic, difficulty: Difficulty): Omit<Question, 'id'> => {
  let text = '';
  let answer = '';
  let explanation = '';
  let figure: React.ReactNode | undefined = undefined;

  switch (topic.id) {
    // 1. 正負の数（整数計算）
    case 'm1_int_addition': {
        if (difficulty === '基礎') {
            const isPositive = Math.random() < 0.5;
            const a = isPositive ? randInt(1, 10) : randInt(-10, -1);
            const b = isPositive ? randInt(1, 10) : randInt(-10, -1, [0, -a]);
            text = `${formatNum(a)} + ${formatNum(b)} = ?`;
            answer = (a + b).toString();
            explanation = `基礎：${a > 0 ? '正の数同士' : '負の数同士'}の足し算です。答えは ${answer} です。`;
        } else if (difficulty === '標準') {
            const a = randInt(1, 10);
            const b = randInt(-10, -1);
            if (Math.random() < 0.5) {
                text = `${formatNum(a)} + ${formatNum(b)} = ?`;
                answer = (a + b).toString();
            } else {
                text = `${formatNum(b)} + ${formatNum(a)} = ?`;
                answer = (b + a).toString();
            }
            explanation = `標準：正の数と負の数の足し算です。絶対値の大きい方から小さい方を引き、大きい方の符号をつけます。答えは ${answer} です。`;
        } else { // 発展
            const a = randInt(-9, 9, [0]);
            const b = randInt(-9, 9, [0]);
            const c = randInt(-9, 9, [0]);
            const sum = a + b + c;
            text = `${formatNum(a)} + ${formatNum(b)} + ${formatNum(c)} = ?`;
            answer = sum.toString();
            explanation = `発展：3つの数の足し算です。前から順番に計算します。答えは ${answer} です。`;
        }
        break;
    }
    case 'm1_int_subtraction': {
        if (difficulty === '基礎') {
            let a: number, b: number;
            if (Math.random() < 0.5) { // 正 - 正
                a = randInt(1, 20);
                b = randInt(1, 20);
            } else { // 負 - 負
                a = randInt(-20, -1);
                b = randInt(-20, -1);
            }
            text = `${formatNum(a)} - ${formatNum(b)} = ?`;
            answer = (a - b).toString();
            explanation = `基礎：引き算は、引く数の符号を変えて足し算に直します。${formatNum(a)} + ${formatNum(-b)} = ${a-b}。`;
        } else if (difficulty === '標準') {
            let a: number, b: number;
            if (Math.random() < 0.5) { // 正 - 負
                a = randInt(1, 10);
                b = randInt(-10, -1);
            } else { // 負 - 正
                a = randInt(-10, -1);
                b = randInt(1, 10);
            }
            text = `${formatNum(a)} - ${formatNum(b)} = ?`;
            answer = (a - b).toString();
            explanation = `標準：引き算は、引く数の符号を変えて足し算に直します。${formatNum(a)} + ${formatNum(-b)} = ${a-b}。`;
        } else { // 発展
            const a = randInt(-9, 9, [0]);
            const b = randInt(-9, 9, [0]);
            const c = randInt(-9, 9, [0]);
            const result = a - b + c; // e.g. a - b - (-c)
            text = `${formatNum(a)} - ${formatNum(b)} + ${formatNum(c)} = ?`;
            answer = result.toString();
            explanation = `発展：3つの数の計算です。前から順番に計算します。答えは ${answer} です。`;
        }
        break;
    }
    case 'm1_int_multiplication': {
         if (difficulty === '基礎') {
            const isPositive = Math.random() < 0.5;
            const a = isPositive ? randInt(2, 9) : randInt(-9, -2);
            const b = isPositive ? randInt(2, 9) : randInt(-9, -2);
            text = `${formatNum(a)} × ${formatNum(b)} = ?`;
            answer = (a * b).toString();
            explanation = `基礎：同符号のかけ算は、答えが正の数になります。答えは ${answer} です。`;
        } else if (difficulty === '標準') {
            const a = randInt(2, 9);
            const b = randInt(-9, -2);
            if (Math.random() < 0.5) {
                text = `${formatNum(a)} × ${formatNum(b)} = ?`;
                answer = (a * b).toString();
            } else {
                text = `${formatNum(b)} × ${formatNum(a)} = ?`;
                answer = (b * a).toString();
            }
            explanation = `標準：異符号のかけ算は、答えが負の数になります。答えは ${answer} です。`;
        } else { // 発展
            const a = randInt(-4, 4, [0, 1, -1]);
            const exp = randInt(2, 3);
            const b = randInt(-5, 5, [0, 1, -1]);
            text = `${formatNum(a)}^${exp} × ${formatNum(b)} = ?`;
            const result = Math.pow(a, exp) * b;
            answer = result.toString();
            explanation = `発展：累乗を含む計算です。先に累乗を計算します。${formatNum(a)}^${exp}は${Math.pow(a,exp)}です。答えは ${answer} です。`;
        }
        break;
    }
    case 'm1_int_division': {
        if (difficulty === '基礎') {
            const isPositive = Math.random() < 0.5;
            const quotient = isPositive ? randInt(2, 9) : randInt(-9, -2);
            const divisor = isPositive ? randInt(2, 9) : randInt(-9, -2);
            const dividend = quotient * divisor;
            text = `${formatNum(dividend)} ÷ ${formatNum(divisor)} = ?`;
            answer = quotient.toString();
            explanation = `基礎：同符号のわり算は、答えが正の数になります。答えは ${answer} です。`;
        } else if (difficulty === '標準') {
            const quotient = randInt(-9, -2);
            const divisor = randInt(2, 9);
            const dividend = quotient * divisor;
             if (Math.random() < 0.5) {
                text = `${formatNum(dividend)} ÷ ${formatNum(divisor)} = ?`;
                answer = quotient.toString();
            } else {
                text = `${formatNum(dividend)} ÷ ${formatNum(quotient)} = ?`;
                answer = divisor.toString();
            }
            explanation = `標準：異符号のわり算は、答えが負の数になります。答えは ${answer} です。`;
        } else { // 発展
            const a = randInt(2, 5);
            const b = randInt(2, 5);
            const dividend = a * b * randInt(2, 5) * (Math.random() > 0.5 ? 1 : -1);
            text = `${dividend} ÷ ${formatNum(a)} ÷ ${formatNum(b)} = ?`;
            const answerVal = dividend / a / b;
            answer = answerVal.toString();
            explanation = `発展：3つの数のわり算です。前から順に計算します。${dividend} ÷ ${a} = ${dividend/a}。次に ${dividend/a} ÷ ${b} = ${answerVal}。`;
        }
        break;
    }
    case 'm1_algebra_simplify': { // 同類項の整理
        const variable = Math.random() < 0.5 ? 'x' : 'a';
        if (difficulty === '基礎') {
            const a = randInt(1, 9);
            const b = randInt(1, 9);
            const op = Math.random() < 0.5 ? '+' : '-';
            if (op === '+') {
                text = `${a}${variable} + ${b}${variable} = ?`;
                answer = `${a + b}${variable}`;
            } else {
                const big = Math.max(a, b);
                const small = Math.min(a, b);
                text = `${big}${variable} - ${small}${variable} = ?`;
                answer = `${big - small}${variable}`;
            }
            explanation = `基礎：同じ文字の項（同類項）は、係数を計算してまとめることができます。答えは ${answer} です。`;
        } else if (difficulty === '標準') {
            const a = randInt(1, 5);
            const b = randInt(-5, 5);
            const c = randInt(1, 5);
            const d = randInt(-5, 5);
            text = `(${a}x ${b >= 0 ? `+ ${b}` : `- ${-b}`}) - (${c}x ${d >= 0 ? `+ ${d}` : `- ${-d}`}) = ?`;
            const xCoeff = a - c;
            const constTerm = b - d;
            let res = '';
            if (xCoeff !== 0) res += `${xCoeff === 1 ? '' : xCoeff === -1 ? '-' : xCoeff}x`;
            if (constTerm !== 0) {
                if (constTerm > 0 && res !== '') res += `+${constTerm}`;
                else res += constTerm.toString();
            }
            if (res === '') res = '0';
            answer = res;
            explanation = `標準：かっこを外して同類項をまとめます。-(...)のかっこを外すときは符号が変わることに注意。答えは ${answer}。`;
        } else { // 発展
            const d1 = randInt(2, 5);
            const n1 = randInt(1, d1-1);
            const d2 = randInt(2, 5);
            const n2 = randInt(1, d2-1);
            text = `(${n1}/${d1})x + (${n2}/${d2})x = ?`;
            const commonDen = lcm(d1, d2);
            const num = n1 * (commonDen / d1) + n2 * (commonDen / d2);
            const [sNum, sDen] = simplifyFraction(num, commonDen);
            answer = sDen === 1 ? `${sNum}x` : `(${sNum}/${sDen})x`;
            explanation = `発展：分数の係数を通分して計算します。答えは ${answer}。`;
        }
        break;
    }
    case 'm1_algebra_distributive': { // 分配法則
        if (difficulty === '基礎') {
            const a = randInt(2, 9);
            const b = randInt(2, 9);
            text = `${a}x × ${b}y = ?`;
            answer = `${a*b}xy`;
            explanation = `基礎：単項式同士の積は、係数同士、文字同士を掛け合わせます。答えは ${answer}。`;
        } else if (difficulty === '標準') {
            const a = randInt(2, 9) * (Math.random() < 0.5 ? 1 : -1);
            const b = randInt(1, 5);
            const c = randInt(-5, 5, [0]);
            text = `${a}(${b}x ${c >= 0 ? `+ ${c}` : `- ${-c}`}) = ?`;
            const xCoeff = a * b;
            const constTerm = a * c;
            answer = `${xCoeff}x${constTerm >= 0 ? `+${constTerm}` : `${constTerm}`}`;
            explanation = `標準：分配法則を使ってかっこを外します。${a}をかっこの中の各項に掛けます。答えは ${answer}。`;
        } else { // 発展
            const a = randInt(2, 5);
            const b = randInt(1, 5);
            const c = randInt(1, 5);
            const d = randInt(2, 5);
            const e = randInt(-5, 5, [0]);
            const f = randInt(-5, 5, [0]);
            text = `${a}(${b}x ${e > 0 ? `+ ${e}` : `- ${-e}`}) + ${d}(${c}x ${f > 0 ? `+ ${f}` : `- ${-f}`}) = ?`;
            const xCoeff = a*b + d*c;
            const constTerm = a*e + d*f;
            let res = '';
            if (xCoeff !== 0) res += `${xCoeff}x`;
            if (constTerm !== 0) {
                if (constTerm > 0 && res !== '') res += `+${constTerm}`;
                else res += constTerm.toString();
            }
            if(res === '') res = '0';
            answer = res;
            explanation = `発展：分配法則でかっこを外し、同類項をまとめます。答えは ${answer}。`;
        }
        break;
    }
    case 'm1_linear_equations_basic': { // 一次方程式 基本
        const x = randInt(1, 9);
        if (difficulty === '基礎') {
            if (Math.random() < 0.5) {
                const a = randInt(1, 10);
                text = `x + ${a} = ${x + a} を解きなさい。(x=の形で)`;
                answer = `x=${x}`;
                explanation = `基礎：両辺から${a}を引くと x = ${x} となります。`;
            } else {
                const a = randInt(2, 5);
                text = `${a}x = ${a * x} を解きなさい。(x=の形で)`;
                answer = `x=${x}`;
                explanation = `基礎：両辺を${a}で割ると x = ${x} となります。`;
            }
        } else if (difficulty === '標準') {
            const a = randInt(2, 5);
            const b = randInt(-10, 10, [0]);
            const c = a * x + b;
            text = `${a}x ${b > 0 ? `+ ${b}` : `- ${-b}`} = ${c} を解きなさい。(x=の形で)`;
            answer = `x=${x}`;
            explanation = `標準：移項して整理します。${b}を右辺に移項して ${a}x = ${c - b}。両辺を${a}で割ると x = ${x}。`;
        } else { // 発展
            const a = randInt(2, 5);
            const c = randInt(1, a - 1);
            const b = randInt(-10, 10, [0]);
            const d = (a - c) * x + b;
            text = `${a}x + ${b} = ${c}x + ${d} を解きなさい。(x=の形で)`;
            answer = `x=${x}`;
            explanation = `発展：文字の項を左辺に、数の項を右辺に移項して整理します。(${a}-${c})x = ${d}-${b}。${a-c}x = ${d-b}。よって x=${x}。`;
        }
        break;
    }
    case 'm1_linear_equations_parentheses': { // 一次方程式 かっこ
        const x = randInt(-5, 5, [0]);
        if (difficulty === '基礎') {
            const a = randInt(2, 5);
            const b = randInt(-5, 5, [0]);
            const c = a * (x + b);
            text = `${a}(x ${b > 0 ? `+ ${b}` : `- ${-b}`}) = ${c} を解きなさい。(x=の形で)`;
            answer = `x=${x}`;
            explanation = `基礎：まず両辺を${a}で割るか、分配法則でかっこを外します。x + ${b} = ${c/a}。移項して x = ${x}。`;
        } else if (difficulty === '標準') {
            const a = randInt(2, 5);
            const b = randInt(-3, 3, [0]);
            const c = randInt(2, 5, [a]);
            const d = randInt(-3, 3, [0, b]);
            const e = a * (x + b) - c * (x + d);
            text = `${a}(x ${b>0?`+ ${b}`:`- ${-b}`}) - ${c}(x ${d>0?`+ ${d}`:`- ${-d}`}) = ${e} を解きなさい。(x=の形で)`;
            answer = `x=${x}`;
            explanation = `標準：分配法則でかっこを外し、同類項をまとめて解きます。答えは x=${x}。`;
        } else { // 発展
            const d = randInt(2, 5);
            const b = randInt(-5, 5, [0]);
            const c = (x+b)/d;
            text = `(x ${b>0?`+ ${b}`:`- ${-b}`}) / ${d} = ${c} を解きなさい。(x=の形で)`;
            answer = `x=${x}`;
            explanation = `発展：分数の方程式です。両辺に分母の${d}を掛けて分数をなくします。x + ${b} = ${c*d}。移項して x=${x}。`;
        }
        break;
    }
    case 'm1_direct_proportion': { // 比例
        const a = randInt(2, 5) * (Math.random() > 0.5 ? 1 : -1);
        if (difficulty === '基礎') {
            const x = randInt(2, 5);
            text = `y = ${a}x について、x=${x}のときのyの値を求めなさい。`;
            answer = (a * x).toString();
            explanation = `基礎：y=${a}xの式にx=${x}を代入します。y = ${a} × ${x} = ${answer}。`;
        } else if (difficulty === '標準') {
            const x = randInt(2, 5);
            const y = a * x;
            text = `yはxに比例し、x=${x}のときy=${y}です。yをxの式で表しなさい。(y=axの形で)`;
            const [sY, sX] = simplifyFraction(y, x);
            answer = sX === 1 ? `y=${sY}x` : `y=(${sY}/${sX})x`;
            explanation = `標準：y=axにx=${x}, y=${y}を代入し、比例定数aを求めます。a = y/x = ${y}/${x}。よって ${answer}。`;
        } else { // 発展
            const x1 = randInt(2, 5);
            const y1 = a * x1;
            const x2 = randInt(6, 10);
            const y2 = a * x2;
            text = `yはxに比例し、x=${x1}のときy=${y1}です。x=${x2}のとき、yはいくつですか？`;
            answer = y2.toString();
            explanation = `発展：まず比例定数を求めます。a = ${y1}/${x1} = ${a}。式はy=${a}x。これにx=${x2}を代入して y=${y2}。`;
        }
        break;
    }
    case 'm1_inverse_proportion': { // 反比例
        const k = [12, 18, 24, 30, 36][randInt(0,4)] * (Math.random() > 0.5 ? 1 : -1);
        if (difficulty === '基礎') {
            const x = [2, 3, 4, 6].find(n => k%n === 0) || 2;
            text = `y = ${k}/x について、x=${x}のときのyの値を求めなさい。`;
            answer = (k / x).toString();
            explanation = `基礎：y=${k}/xの式にx=${x}を代入します。y = ${k} / ${x} = ${answer}。`;
        } else if (difficulty === '標準') {
            const x = [2, 3, 4, 6].find(n => k%n === 0) || 2;
            const y = k / x;
            text = `yはxに反比例し、x=${x}のときy=${y}です。yをxの式で表しなさい。(y=k/xの形で)`;
            answer = `y=${k}/x`;
            explanation = `標準：y=k/xにx=${x}, y=${y}を代入し、比例定数kを求めます。k = xy = ${x} × ${y} = ${k}。よって ${answer}。`;
        } else { // 発展
            const x1 = [2, 3, 4, 6].find(n => k%n === 0) || 2;
            const y1 = k / x1;
            const x2 = [2, 3, 4, 6].find(n => k%n === 0 && n !== x1) || 3;
            const y2 = k / x2;
            text = `yはxに反比例し、x=${x1}のときy=${y1}です。x=${x2}のとき、yはいくつですか？`;
            answer = y2.toString();
            explanation = `発展：まず比例定数を求めます。k = ${x1} × ${y1} = ${k}。式はy=${k}/x。これにx=${x2}を代入して y=${y2}。`;
        }
        break;
    }
    case 'm1_prime_factorization': { // 素因数分解
        let numToFactor;
        if (difficulty === '基礎') {
            numToFactor = [12, 18, 20, 28, 30, 45, 50][randInt(0, 6)];
            explanation = `基礎：${numToFactor}を小さい素数で順番に割っていきます。`;
        } else if (difficulty === '標準') {
            numToFactor = [72, 80, 90, 100, 120, 150][randInt(0, 5)];
            explanation = `標準：${numToFactor}を小さい素数で順番に割っていきます。`;
        } else { // 発展 (GCD/LCM)
            const n1 = randInt(12, 30);
            const n2 = randInt(12, 30, [n1]);
            const result_gcd = gcd(n1, n2);
            const result_lcm = lcm(n1, n2);
            if (Math.random() < 0.5) {
                text = `${n1}と${n2}の最大公約数を求めなさい。`;
                answer = result_gcd.toString();
                explanation = `発展：それぞれの数を素因数分解し、共通する素因数を掛け合わせます。答えは${answer}。`;
            } else {
                text = `${n1}と${n2}の最小公倍数を求めなさい。`;
                answer = result_lcm.toString();
                explanation = `発展：それぞれの数を素因数分解し、すべての素因数を最も多く含むように掛け合わせます。答えは${answer}。`;
            }
            return { text, answer, explanation, figure };
        }
        
        text = `${numToFactor} を素因数分解しなさい。 (例: 2^2*3)`;
        const factors = primeFactorize(numToFactor);
        answer = Object.entries(factors)
            .sort(([baseA], [baseB]) => Number(baseA) - Number(baseB))
            .map(([base, exp]) => (exp > 1 ? `${base}^${exp}` : base))
            .join('*');
        explanation += `答えは ${answer.replace(/\*/g, ' × ')} となります。`;
        break;
    }
    case 'm1_solid_volume': { // 立体の体積
        if (difficulty === '基礎') { // 直方体・立方体
            const l = randInt(3, 8);
            const w = randInt(3, 8);
            const h = randInt(3, 8);
            text = `たて${l}cm, よこ${w}cm, 高さ${h}cmの直方体の体積を求めなさい。`;
            answer = (l*w*h).toString();
            explanation = `基礎：直方体の体積 = たて × よこ × 高さ。 ${l} × ${w} × ${h} = ${answer}cm³。`;
        } else if (difficulty === '標準') { // 三角柱・円柱
            const h = randInt(5, 10);
            if (Math.random() < 0.5) { // 三角柱
                const base = randInt(4, 8);
                const baseH = randInt(3, 6);
                text = `底辺${base}cm, 高さ${baseH}cmの三角形を底面とし、高さが${h}cmの三角柱の体積を求めなさい。`;
                answer = ((base * baseH / 2) * h).toString();
                explanation = `標準：三角柱の体積 = 底面積 × 高さ。底面積は ${base}×${baseH}÷2 = ${base*baseH/2}cm²。体積は ${base*baseH/2} × ${h} = ${answer}cm³。`;
            } else { // 円柱
                const r = randInt(2, 5);
                text = `半径${r}cmの円を底面とし、高さが${h}cmの円柱の体積を求めなさい。(円周率はπとする)`;
                answer = `${r*r*h}π`;
                explanation = `標準：円柱の体積 = 底面積 × 高さ = (半径)²×π × 高さ。 (${r})²×π × ${h} = ${answer}cm³。`;
            }
        } else { // 発展
             const l1 = randInt(6, 10);
             const w1 = randInt(6, 10);
             const h1 = randInt(3, 5);
             const l2 = randInt(3, l1-2);
             const w2 = randInt(3, w1-2);
             const h2 = randInt(3, 5);
             text = `図のように、大きな直方体(たて${l1},よこ${w1},高さ${h1})の上に小さな直方体(たて${l2},よこ${w2},高さ${h2})が乗っている立体の体積を求めなさい。(単位:cm)`;
             const vol1 = l1*w1*h1;
             const vol2 = l2*w2*h2;
             answer = (vol1+vol2).toString();
             explanation = `発展：2つの直方体の体積をそれぞれ計算して足し合わせます。下の体積: ${vol1}。上の体積: ${vol2}。合計: ${vol1}+${vol2}=${answer}cm³。`;
        }
        break;
    }
    default:
      return { text: `「${topic.name}」の問題は準備中です。`, answer: '', explanation: '' };
  }
  return { text, answer, explanation, figure };
};