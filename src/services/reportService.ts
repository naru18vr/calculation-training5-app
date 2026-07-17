import type { QuizResult } from '../types';

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export const createHistoryCsv = (history: QuizResult[]): string => {
    const rows = history.map(session => {
        const correct = session.results.filter(result => result.isCorrect).length;
        const seconds = Math.round((session.endTime - session.startTime) / 1000);
        return [
            new Date(session.endTime).toLocaleString('ja-JP'), session.grade, session.topic.name,
            session.difficulty ?? '', session.results.length, correct,
            session.results.length ? Math.round(correct / session.results.length * 100) : 0, seconds,
        ];
    });
    return [
        ['日時', '学年', '単元', '難易度', '問題数', '正解数', '正答率(%)', '学習時間(秒)'],
        ...rows,
    ].map(row => row.map(csvCell).join(',')).join('\r\n');
};

export const downloadHistoryCsv = (history: QuizResult[], learnerName: string) => {
    const blob = new Blob([`\uFEFF${createHistoryCsv(history)}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${learnerName}-学習記録-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
};
