
import React from 'react';
import type { Topic, Question, Difficulty } from '../types';
import { randInt, gcd } from './utils';

const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

// Helper for fraction simplification and formatting
const simplifyFraction = (num: number, den: number): string => {
    if (num === 0) return '0';
    if (den === 1) return num.toString();
    const common = gcd(Math.abs(num), Math.abs(den));
    const sNum = num / common;
    const sDen = den / common;
    if (sDen === 1) return sNum.toString();
    // Handle mixed numbers
    if (Math.abs(sNum) > sDen) {
        const whole = Math.floor(Math.abs(sNum) / sDen) * Math.sign(sNum);
        const rem = Math.abs(sNum) % sDen;
        if (rem === 0) return whole.toString();
        return `${whole} ${rem}/${sDen}`; // Using a space for mixed numbers
    }
    return `${sNum}/${sDen}`;
};


export const generateG6Question = (topic: Topic, difficulty: Difficulty): Omit<Question, 'id'> => {
  let text = '';
  let answer = '';
  let explanation = '';
  let figure: React.ReactNode | undefined = undefined;

  switch (topic.id) {
    case 'g6_fractions_addition': {
        if (difficulty === '基礎') {
            const d1 = randInt(2, 5);
            const d2 = randInt(d1 + 1, 7);
            const n1 = randInt(1, d1 - 1);
            const n2 = randInt(1, d2 - 1);
            text = `${n1}/${d1} + ${n2}/${d2} = ?`;
            const commonDen = lcm(d1, d2);
            const num = (n1 * (commonDen/d1)) + (n2 * (commonDen/d2));
            answer = simplifyFraction(num, commonDen);
            explanation = `基礎：分母が小さい分数の足し算です。通分して計算します。分母を${commonDen}に揃えると、${n1*(commonDen/d1)}/${commonDen} + ${n2*(commonDen/d2)}/${commonDen} = ${num}/${commonDen}。答えは ${answer}。`;
        } else if (difficulty === '標準') {
            const d1 = randInt(5, 12);
            const d2 = randInt(5, 12, [d1]);
            const n1 = randInt(1, d1 - 1);
            const n2 = randInt(1, d2 - 1);
            text = `${n1}/${d1} + ${n2}/${d2} = ?`;
            const commonDen = lcm(d1, d2);
            const num = (n1 * (commonDen/d1)) + (n2 * (commonDen/d2));
            answer = simplifyFraction(num, commonDen);
            explanation = `標準：分母が大きめの分数の足し算です。通分して計算します。答えは ${answer}。`;
        } else { // 発展
            const whole1 = randInt(1, 3);
            const d1 = randInt(2, 5);
            const n1 = randInt(1, d1 - 1);
            const whole2 = randInt(1, 3);
            const d2 = randInt(2, 5, [d1]);
            const n2 = randInt(1, d2 - 1);
            text = `${whole1} ${n1}/${d1} + ${whole2} ${n2}/${d2} = ?`;
            const num1 = whole1 * d1 + n1;
            const num2 = whole2 * d2 + n2;
            const commonDen = lcm(d1, d2);
            const totalNum = (num1 * (commonDen/d1)) + (num2 * (commonDen/d2));
            answer = simplifyFraction(totalNum, commonDen);
            explanation = `発展：帯分数を仮分数に直して計算します。通分して足し算すると、答えは ${answer} となります。`;
        }
        break;
    }
    case 'g6_fractions_subtraction': {
        let n1: number, d1: number, n2: number, d2: number, whole1: number | null = null, whole2: number | null = null;
        if (difficulty === '基礎') {
            d1 = randInt(2, 5); d2 = randInt(d1 + 1, 7); n1 = randInt(1, d1 - 1); n2 = randInt(1, d2 - 1);
        } else if (difficulty === '標準') {
            d1 = randInt(5, 12); d2 = randInt(5, 12, [d1]); n1 = randInt(1, d1 - 1); n2 = randInt(1, d2 - 1);
        } else { // 発展
            whole1 = randInt(2, 4); d1 = randInt(2, 5); n1 = randInt(1, d1 - 1);
            whole2 = randInt(1, whole1 - 1); d2 = randInt(2, 5, [d1]); n2 = randInt(1, d2 - 1);
        }

        const val1 = (whole1 || 0) + n1/d1;
        const val2 = (whole2 || 0) + n2/d2;
        
        const [bigW, bigN, bigD, smallW, smallN, smallD] = val1 > val2 ? [whole1, n1, d1, whole2, n2, d2] : [whole2, n2, d2, whole1, n1, d1];
        
        const bigNum = (bigW || 0) * bigD + bigN;
        const smallNum = (smallW || 0) * smallD + smallN;

        text = `${bigW ? `${bigW} ` : ''}${bigN}/${bigD} - ${smallW ? `${smallW} ` : ''}${smallN}/${smallD} = ?`;
        
        const commonDen = lcm(bigD, smallD);
        const num = (bigNum * (commonDen/bigD)) - (smallNum * (commonDen/smallD));
        answer = simplifyFraction(num, commonDen);
        explanation = `通分して引き算をします。大きい分数から小さい分数を引きます。答えは ${answer}。`;
        break;
    }
    case 'g6_fractions_multiplication': {
        if (difficulty === '基礎') {
            const d1 = randInt(2, 5); const n1 = randInt(1, d1 - 1);
            const d2 = randInt(2, 5); const n2 = randInt(1, n1 === 1 ? d2 : d2 - 1);
            text = `${n1}/${d1} × ${n2}/${d2} = ?`;
            const num = n1 * n2;
            const den = d1 * d2;
            answer = simplifyFraction(num, den);
            explanation = `基礎：分子同士、分母同士をかけます。(${n1}×${n2})/(${d1}×${d2})=${num}/${den}。約分して ${answer}。`;
        } else if (difficulty === '標準') {
            if (Math.random() < 0.5) { // Integer * Fraction
                const int = randInt(2, 5);
                const d = randInt(2, 7);
                const n = randInt(1, d - 1);
                text = `${int} × ${n}/${d} = ?`;
                answer = simplifyFraction(int * n, d);
                explanation = `標準：整数を分数と考えて計算します。(${int}/1) × (${n}/${d}) = ${int*n}/${d}。答えは ${answer}。`;
            } else { // Mixed Number * Fraction
                const whole = randInt(1, 2);
                const d1 = randInt(2, 4);
                const n1 = randInt(1, d1 - 1);
                const d2 = randInt(2, 4);
                const n2 = randInt(1, d2 - 1);
                text = `${whole} ${n1}/${d1} × ${n2}/${d2} = ?`;
                const num1 = whole * d1 + n1;
                answer = simplifyFraction(num1 * n2, d1 * d2);
                explanation = `標準：帯分数を仮分数に直して計算します。(${num1}/${d1}) × (${n2}/${d2})。答えは ${answer}。`;
            }
        } else { // 発展
            const common = randInt(2, 4);
            const n1 = randInt(2, 5) * common;
            const d1 = randInt(2, 5);
            const n2 = randInt(2, 5);
            const d2 = randInt(2, 5) * common;
            text = `${n1}/${d1} × ${n2}/${d2} = ?`;
            answer = simplifyFraction(n1 * n2, d1 * d2);
            explanation = `発展：かけ算の途中で約分すると計算が簡単になります。答えは ${answer}。`;
        }
        break;
    }
    case 'g6_fractions_division': {
        if (difficulty === '基礎') {
            const d1 = randInt(2, 5);
            const n1 = randInt(1, d1 - 1);
            const d2 = randInt(2, 5);
            const n2 = randInt(1, d2 - 1);
            text = `${n1}/${d1} ÷ ${n2}/${d2} = ?`;
            answer = simplifyFraction(n1 * d2, d1 * n2);
            explanation = `基礎：わる数の分母と分子を入れ替えた逆数をかけます。${n1}/${d1} × ${d2}/${n2}。答えは ${answer}。`;
        } else if (difficulty === '標準') {
            if (Math.random() < 0.5) { // Integer / Fraction
                const int = randInt(2, 5);
                const d = randInt(2, 7);
                const n = randInt(1, d - 1);
                text = `${int} ÷ ${n}/${d} = ?`;
                answer = simplifyFraction(int * d, n);
                explanation = `標準：わる数の逆数をかけます。${int} × ${d}/${n}。答えは ${answer}。`;
            } else { // Mixed Number / Fraction
                const whole = randInt(1, 2);
                const d1 = randInt(2, 4);
                const n1 = randInt(1, d1 - 1);
                const d2 = randInt(2, 4);
                const n2 = randInt(1, d2 - 1);
                text = `${whole} ${n1}/${d1} ÷ ${n2}/${d2} = ?`;
                const num1 = whole * d1 + n1;
                answer = simplifyFraction(num1 * d2, d1 * n2);
                explanation = `標準：帯分数を仮分数に直し、わる数の逆数をかけます。答えは ${answer}。`;
            }
        } else { // 発展
            const common = randInt(2, 4);
            const n1 = randInt(2, 5) * common;
            const d1 = randInt(2, 5);
            const n2 = randInt(2, 5) * common;
            const d2 = randInt(2, 5);
            text = `${n1}/${d1} ÷ ${n2}/${d2} = ?`;
            answer = simplifyFraction(n1 * d2, d1 * n2);
            explanation = `発展：逆数をかけるときに約分すると計算が簡単になります。答えは ${answer}。`;
        }
        break;
    }
    // Speed, Time, Distance
    case 'g6_speed':
    case 'g6_time':
    case 'g6_distance': {
        let speed: number, time: number, distance: number;
        if (difficulty === '基礎') {
            time = randInt(2, 5); // hours
            speed = randInt(10, 50); // km/h
            distance = speed * time; // km
        } else if (difficulty === '標準') {
            time = randInt(5, 25) / 10; // 0.5 to 2.5 hours
            speed = randInt(4, 20) * 10; // 40 to 200 km/h
            distance = parseFloat((speed * time).toFixed(2));
        } else { // 発展
             // Generate values for the question type
            const questionType = topic.id;
            if (questionType === 'g6_speed') {
                const timeInSec = randInt(120, 300); // 2 to 5 minutes
                const distInM = randInt(500, 2000);
                text = `${distInM}mを${Math.floor(timeInSec / 60)}分${timeInSec % 60}秒で進むと、時速何kmですか？`;
                answer = ((distInM / timeInSec) * 3.6).toFixed(1);
                explanation = `単位を揃えます。${distInM}m/sは時速${answer}kmです。`;
            } else if (questionType === 'g6_time') {
                const speedInKmh = randInt(40, 100);
                const distInM = randInt(1000, 5000);
                text = `時速${speedInKmh}kmで${distInM}m進むには何分何秒かかりますか？(秒未満は切り捨て)`;
                const timeInSec = Math.floor((distInM / 1000) / speedInKmh * 3600);
                answer = `${Math.floor(timeInSec / 60)}分${timeInSec % 60}秒`;
                explanation = `時間 = 距離 ÷ 速さ。単位をmと秒に揃えて計算し、最後に分秒に直します。`;
            } else { // distance
                const speedInKmh = randInt(30, 90);
                const timeInMin = randInt(10, 50);
                text = `時速${speedInKmh}kmで${timeInMin}分進むと、何km進みますか？`;
                answer = (speedInKmh * (timeInMin / 60)).toFixed(1);
                explanation = `距離 = 速さ × 時間。${timeInMin}分を時間に直して計算します。`;
            }
            return {text, answer, explanation};
        }

        switch (topic.id) {
            case 'g6_speed':
                text = `${distance}kmを${time}時間で進むと、時速何kmですか？`;
                answer = (distance / time).toString();
                explanation = `速さ = 距離 ÷ 時間。 ${distance} ÷ ${time} = ${answer}km/時。`;
                break;
            case 'g6_time':
                text = `時速${speed}kmで${distance}km進むと、何時間かかりますか？`;
                answer = time.toString();
                explanation = `時間 = 距離 ÷ 速さ。 ${distance} ÷ ${speed} = ${answer}時間。`;
                break;
            case 'g6_distance':
                text = `時速${speed}kmで${time}時間進むと、何km進みますか？`;
                answer = distance.toString();
                explanation = `距離 = 速さ × 時間。 ${speed} × ${time} = ${answer}km。`;
                break;
        }
        break;
    }
    case 'g6_ratios': {
        const common = randInt(2, 5);
        if (difficulty === '基礎') {
            const a = randInt(1, 5);
            const b = randInt(1, 5, [a]);
            text = `${a * common}:${b * common} の比を最も簡単な整数の比にしなさい。(a:bの形で)`;
            answer = `${a}:${b}`;
            explanation = `基礎：両方の数を最大公約数である${common}でわります。答えは ${a}:${b}。`;
        } else if (difficulty === '標準') {
            if (Math.random() < 0.5) { // decimals
                const a = randInt(1, 9);
                const b = randInt(1, 9, [a]);
                text = `${a/10}:${b/10} の比を最も簡単な整数の比にしなさい。(a:bの形で)`;
                const commonDiv = gcd(a, b);
                answer = `${a/commonDiv}:${b/commonDiv}`;
                explanation = `標準：まず両方を10倍して整数にします(${a}:${b})。次に最大公約数でわります。答えは ${answer}。`;
            } else { // fractions
                const d1 = randInt(2, 7);
                const d2 = randInt(2, 7);
                const n1 = randInt(1, d1-1);
                const n2 = randInt(1, d2-1);
                text = `${n1}/${d1}:${n2}/${d2} の比を最も簡単な整数の比にしなさい。(a:bの形で)`;
                const commonDen = lcm(d1, d2);
                const resA = n1 * (commonDen/d1);
                const resB = n2 * (commonDen/d2);
                const commonDiv = gcd(resA, resB);
                answer = `${resA/commonDiv}:${resB/commonDiv}`;
                explanation = `標準：両方に分母の最小公倍数(${commonDen})をかけて整数にします(${resA}:${resB})。次に最大公約数でわります。答えは ${answer}。`;
            }
        } else { // 発展
            const a = randInt(1, 4);
            const b = randInt(1, 4, [a]);
            const c = randInt(1, 4, [a, b]);
            text = `${a * common}:${b * common}:${c * common} の比を最も簡単な整数の比にしなさい。(a:b:cの形で)`;
            answer = `${a}:${b}:${c}`;
            explanation = `発展：3つの数の最大公約数である${common}でわります。答えは ${a}:${b}:${c}。`;
        }
        break;
    }
    case 'g6_per_unit_quantity': {
        if (difficulty === '基礎') {
            const quantity = randInt(2, 9);
            const unitValue = randInt(10, 50);
            const total = quantity * unitValue;
            text = `${total}円で${quantity}個のお菓子を買いました。1個あたり何円ですか？`;
            answer = unitValue.toString();
            explanation = `基礎：合計の値段を個数で割ります。${total} ÷ ${quantity} = ${answer}円。`;
        } else if (difficulty === '標準') {
            const quantity = randInt(2, 5);
            const total = randInt(1, 10) / 2; // 0.5, 1, 1.5 ...
            const unitValue = parseFloat((total / quantity).toFixed(2));
            text = `${total}Lのジュースを${quantity}人で分けます。1人あたり何Lですか？`;
            answer = unitValue.toString();
            explanation = `標準：合計の量を人数で割ります。${total} ÷ ${quantity} = ${answer}L。`;
        } else { // 発展
            const area = randInt(20, 50); // m^2
            const people = randInt(10, area - 5);
            text = `広さ${area}m²の部屋に${people}人います。1人あたりの面積は何m²ですか？(小数第2位を四捨五入)`;
            answer = (Math.round((area / people) * 10) / 10).toString();
            explanation = `発展：これは人口密度の逆の考え方です。全体の面積を人数で割ります。${area} ÷ ${people} ≒ ${answer}m²。`;
        }
        break;
    }
    case 'g6_circle_area': {
        let radius: number;
        if (difficulty === '基礎') {
            radius = randInt(2, 10);
        } else if (difficulty === '標準') {
            radius = randInt(5, 25) / 10; // 0.5 to 2.5
        } else { // 発展
            radius = randInt(4, 12); // Use integer for semicircle to keep it simpler
        }

        const area = parseFloat((radius * radius * 3.14).toFixed(4));

        if (difficulty === '発展') {
            text = `図の半円の面積を求めなさい。直径は${radius*2}cmです。(円周率は3.14とする)`;
            answer = (area / 2).toString().replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
            explanation = `発展：まず円全体の面積を計算し、それを2で割ります。半径は${radius}cmです。面積 = ${radius}×${radius}×3.14 ÷ 2 = ${answer}cm²。`;
        } else {
            text = `半径${radius}cmの円の面積を求めなさい。(円周率は3.14とする)`;
            answer = area.toString().replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
            explanation = `円の面積 = 半径 × 半径 × 3.14。 ${radius} × ${radius} × 3.14 = ${answer}cm²。`;
        }
        
        const svgSize = 180;
        const R = 75;
        const cx = svgSize / 2, cy = svgSize / 2;
        figure = React.createElement('svg', { width: svgSize, height: svgSize, viewBox: `0 0 ${svgSize} ${svgSize}`, style: { pointerEvents: 'none' } },
            React.createElement('circle', {
                cx: cx, cy: cy, r: R,
                fill: "rgba(80, 160, 240, 0.3)",
                stroke: "#334155",
                strokeWidth: "2"
            }),
            React.createElement('line', {
                x1: cx, y1: cy, x2: cx + R, y2: cy,
                stroke: "#f59e0b",
                strokeWidth: "2"
            }),
            React.createElement('text', {
                x: cx + R/2, y: cy - 8,
                fontSize: "16",
                textAnchor: "middle",
                fill: "#f59e0b"
            }, `${radius}cm`)
        );
        break;
    }
    default:
      return { text: `「${topic.name}」の問題は準備中です。`, answer: '', explanation: '' };
  }
  return { text, answer, explanation, figure };
};