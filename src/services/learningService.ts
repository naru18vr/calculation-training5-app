import { GRADES, TOPICS_BY_GRADE } from '../constants';
import type { Grade, QuizResult, StudentProfile, Topic, TopicId } from '../types';

export interface TopicProgress {
    attempts: number;
    answered: number;
    correct: number;
    accuracy: number;
    mastery: number;
    lastStudiedAt: number | null;
}

export interface LessonContent {
    overview: string;
    points: string[];
    example: string;
}

const EMPTY_PROGRESS: TopicProgress = {
    attempts: 0,
    answered: 0,
    correct: 0,
    accuracy: 0,
    mastery: 0,
    lastStudiedAt: null,
};

export const getTopicProgress = (history: QuizResult[], topicId: TopicId): TopicProgress => {
    const sessions = history.filter(result =>
        result.topic.id === topicId || result.results.some(item => item.question.topicId === topicId),
    ).slice(0, 5);
    if (sessions.length === 0) return EMPTY_PROGRESS;

    const relevantResults = sessions.flatMap(session => session.topic.id === topicId
        ? session.results
        : session.results.filter(item => item.question.topicId === topicId));
    const answered = relevantResults.length;
    const correct = sessions.reduce(
        (total, session) => total + (session.topic.id === topicId
            ? session.results.filter(result => result.isCorrect).length
            : session.results.filter(result => result.question.topicId === topicId && result.isCorrect).length),
        0,
    );
    const accuracy = answered === 0 ? 0 : Math.round((correct / answered) * 100);
    const difficultyBonus = Math.max(...sessions.map(session =>
        session.difficulty === '発展' ? 15 : session.difficulty === '標準' ? 8 : 0,
    ));
    const practiceBonus = Math.min(15, sessions.length * 3);

    return {
        attempts: sessions.length,
        answered,
        correct,
        accuracy,
        mastery: Math.min(100, Math.round(accuracy * 0.75 + difficultyBonus + practiceBonus)),
        lastStudiedAt: sessions[0].endTime,
    };
};

export const getCourseTopics = (grades: Grade[]): Array<{ grade: Grade; topic: Topic }> =>
    grades.flatMap(grade => TOPICS_BY_GRADE[grade].map(topic => ({ grade, topic })));

export const getProfileCourseGrades = (profile: StudentProfile): Grade[] => {
    const startIndex = GRADES.indexOf(profile.startGrade);
    const reviewStartIndex = Math.max(0, startIndex - 1);
    return GRADES.slice(reviewStartIndex);
};

export const getRecommendedTopic = (history: QuizResult[], grades: Grade[]) => {
    const topics = getCourseTopics(grades);
    return [...topics].sort((first, second) => {
        const firstProgress = getTopicProgress(history, first.topic.id);
        const secondProgress = getTopicProgress(history, second.topic.id);
        if (firstProgress.mastery !== secondProgress.mastery) {
            return firstProgress.mastery - secondProgress.mastery;
        }
        if (firstProgress.lastStudiedAt === null && secondProgress.lastStudiedAt !== null) return -1;
        if (secondProgress.lastStudiedAt === null && firstProgress.lastStudiedAt !== null) return 1;
        return (firstProgress.lastStudiedAt ?? 0) - (secondProgress.lastStudiedAt ?? 0);
    })[0];
};

export const getWeakTopics = (history: QuizResult[], grades: Grade[], limit = 3) =>
    getCourseTopics(grades)
        .map(item => ({ ...item, progress: getTopicProgress(history, item.topic.id) }))
        .filter(item => item.progress.attempts > 0 && item.progress.mastery < 80)
        .sort((first, second) => first.progress.mastery - second.progress.mastery)
        .slice(0, limit);

const lessonRules: Array<{ match: RegExp; content: LessonContent }> = [
    { match: /分数/, content: { overview: '分母は1をいくつに分けたか、分子はそのいくつ分かを表します。', points: ['計算前に分母が同じか確認する', '約分できるときは最も簡単な形にする', '割り算では割る数の逆数をかける'], example: '1/2 + 1/3 = 3/6 + 2/6 = 5/6' } },
    { match: /小数/, content: { overview: '小数点の位置と位取りに注意して計算します。', points: ['かけ算は先に整数として計算する', 'わり算は割る数を整数に直す', '答えの大きさを概算して確かめる'], example: '1.2 × 0.3 = 12 × 3 ÷ 100 = 0.36' } },
    { match: /割合|百分率/, content: { overview: '割合は「比べる量が、もとにする量の何倍か」を表します。', points: ['割合＝比べる量÷もとにする量', '比べる量＝もとにする量×割合', '百分率は割合を100倍する'], example: '80人中20人なら、20÷80＝0.25＝25%' } },
    { match: /速さ|時間|距離/, content: { overview: '速さ・時間・距離の関係を同じ単位にそろえて考えます。', points: ['速さ＝距離÷時間', '距離＝速さ×時間', '時間＝距離÷速さ'], example: '時速60kmで2時間進む距離は 60×2＝120km' } },
    { match: /方程式/, content: { overview: '等式の両辺に同じ操作をして、未知数だけを残します。', points: ['かっこを外して同類項を整理する', '文字の項と数の項を分ける', '求めた解を元の式に代入して確認する'], example: '3x+5=17 → 3x=12 → x=4' } },
    { match: /文字式|同類項|展開|因数分解/, content: { overview: '文字を数と同じように扱い、式の構造を見抜いて変形します。', points: ['同じ文字・次数の項だけをまとめる', '分配法則の符号に注意する', '展開と因数分解は逆の操作'], example: '(x+2)(x+3)=x²+5x+6' } },
    { match: /比例|反比例|一次関数/, content: { overview: '数量の変化を式・表・グラフで結び付けます。', points: ['xとyの対応を表で確認する', '変化の割合と切片を区別する', '求めた式に点の座標を代入して確認する'], example: '傾き2、切片3なら y=2x+3' } },
    { match: /平方根/, content: { overview: '2乗するとその数になる値を平方根として扱います。', points: ['√a²では符号と範囲に注意する', '根号内の平方数を外に出す', '加減は同じ根号の項だけまとめる'], example: '√12=√(4×3)=2√3' } },
    { match: /角|合同|証明|三平方|面積|体積|図形/, content: { overview: '図に分かっている条件を書き込み、使える性質や公式を選びます。', points: ['求めるものと既知の条件を整理する', '対応する辺・角の順序をそろえる', '最後に単位を確認する'], example: '直角三角形では a²+b²=c²' } },
    { match: /正負/, content: { overview: '数直線上の向きと距離を意識して正負の数を計算します。', points: ['加法は符号と絶対値を分けて考える', '減法は反対の数を足す形に直す', '乗除は負の数の個数で符号を決める'], example: '(-3)-(+5)=(-3)+(-5)=-8' } },
];

export const getLessonContent = (topic: Topic): LessonContent =>
    lessonRules.find(rule => rule.match.test(topic.name))?.content ?? {
        overview: `${topic.name}の基本的な考え方と解き方を身につけます。`,
        points: ['問題文から必要な数や条件を取り出す', '途中式を書いて順序よく計算する', '答えを問題の条件に戻して確かめる'],
        example: '例題で手順を確認してから、基礎問題に挑戦しましょう。',
    };
