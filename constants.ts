
import type { Grade, Topic, Difficulty } from './types';

export const GRADES: Grade[] = ['小4', '小5', '小6', '中1', '中2', '中3'];

export const DIFFICULTY_LEVELS: { id: Difficulty, name: string, description: string }[] = [
    { id: '基礎', name: '基礎', description: 'まずはここから！' },
    { id: '標準', name: '標準', description: '定着させよう！' },
    { id: '発展', name: '発展', description: '応用へ挑戦！' },
];

export const TOPICS_BY_GRADE: Record<Grade, Topic[]> = {
  '小4': [
    { id: 'g4_addition_subtraction', name: '3桁以上の筆算（足し算・引き算）' },
    { id: 'g4_multiplication', name: 'かけ算（2桁×2桁）' },
    { id: 'g4_division', name: 'わり算（2桁÷1桁）' },
    { id: 'g4_fractions_intro', name: '分数の大小比較' },
    { id: 'g4_rounding', name: 'がい算（概数）' },
    { id: 'g4_unit_conversion', name: '単位換算' },
    { id: 'g4_rectangle_area', name: '長方形の面積' },
  ],
  '小5': [
    { id: 'g5_decimals_multiplication', name: '小数のかけ算' },
    { id: 'g5_decimals_division', name: '小数のわり算' },
    { id: 'g5_fractions_simplify', name: '分数の約分' },
    { id: 'g5_fractions_common_denominator', name: '分数の通分' },
    { id: 'g5_fractions_addition', name: '分数の足し算（同分母）' },
    { id: 'g5_fractions_subtraction', name: '分数の引き算（同分母）' },
    { id: 'g5_percentages', name: '割合（百分率）' },
    { id: 'g5_common_multiples', name: '最小公倍数' },
    { id: 'g5_common_divisors', name: '最大公約数' },
    { id: 'g5_triangle_area', name: '三角形の面積' },
  ],
  '小6': [
    { id: 'g6_fractions_addition', name: '分数の足し算（異分母）' },
    { id: 'g6_fractions_subtraction', name: '分数の引き算（異分母）' },
    { id: 'g6_fractions_multiplication', name: '分数のかけ算' },
    { id: 'g6_fractions_division', name: '分数のわり算' },
    { id: 'g6_speed', name: '速さを求める計算' },
    { id: 'g6_time', name: '時間を求める計算' },
    { id: 'g6_distance', name: '距離を求める計算' },
    { id: 'g6_ratios', name: '比の計算' },
    { id: 'g6_per_unit_quantity', name: '単位量あたりの大きさ' },
    { id: 'g6_circle_area', name: '円の面積' },
  ],
  '中1': [
    { id: 'm1_int_addition', name: '正負の数：足し算' },
    { id: 'm1_int_subtraction', name: '正負の数：引き算' },
    { id: 'm1_int_multiplication', name: '正負の数：かけ算' },
    { id: 'm1_int_division', name: '正負の数：わり算' },
    { id: 'm1_algebra_simplify', name: '文字式：同類項の整理' },
    { id: 'm1_algebra_distributive', name: '文字式：分配法則' },
    { id: 'm1_linear_equations_basic', name: '一次方程式：基本' },
    { id: 'm1_linear_equations_parentheses', name: '一次方程式：かっこ' },
    { id: 'm1_direct_proportion', name: '比例の計算' },
    { id: 'm1_inverse_proportion', name: '反比例の計算' },
    { id: 'm1_prime_factorization', name: '素因数分解' },
    { id: 'm1_solid_volume', name: '立体の体積' },
  ],
  '中2': [
    { id: 'm2_simultaneous_equations_elimination', name: '連立方程式（加減法）' },
    { id: 'm2_simultaneous_equations_substitution', name: '連立方程式（代入法）' },
    { id: 'm2_linear_functions_value', name: '一次関数（値の計算）' },
    { id: 'm2_linear_functions_equation', name: '一次関数（式の決定）' },
    { id: 'm2_expression_expansion_basic', name: '式の展開（基本）' },
    { id: 'm2_expression_expansion_formula', 'name': '式の展開（公式）' },
    { id: 'm2_angle_problems', name: '多角形の角度' },
    { id: 'm2_proof_fill_in_the_blank', name: '合同の証明（穴埋め）' },
  ],
  '中3': [
    { id: 'm3_factorization_basic', name: '因数分解（x²+bx+c）' },
    { id: 'm3_factorization_common_factor', name: '因数分解（共通因数）' },
    { id: 'm3_factorization_formula', name: '因数分解（公式）' },
    { id: 'm3_square_roots_simplify', name: '平方根の簡略化' },
    { id: 'm3_square_roots_calculation', name: '平方根の計算' },
    { id: 'm3_quadratic_equations_factorization', name: '二次方程式（因数分解）' },
    { id: 'm3_quadratic_equations_formula', name: '二次方程式（解の公式）' },
    { id: 'm3_pythagorean_theorem', name: '三平方の定理' },
  ],
};

export const MAX_ATTEMPTS = 3;
export const MAX_HISTORY_ENTRIES = 50;

export const NUM_QUESTIONS_OPTIONS = [
  { num: 10, label: '10問', description: 'いつもの練習' },
  { num: 20, label: '20問', description: 'じっくり挑戦' },
  { num: 30, label: '30問', description: '腕試し！' },
];

export const ENCOURAGEMENT_MESSAGES: Record<string, string> = {
  perfect: 'すごい！パーフェクト！🎉',
  great: '素晴らしい！ほとんど正解だね！✨',
  good: 'よくがんばったね！この調子！👍',
  effort: 'おつかれさま！次もがんばろう！💪'
};