

import React, { useState, useEffect, useMemo, useReducer, useCallback, useRef } from 'react';
import { GRADES, TOPICS_BY_GRADE, MAX_ATTEMPTS, ENCOURAGEMENT_MESSAGES, MAX_HISTORY_ENTRIES, NUM_QUESTIONS_OPTIONS, DIFFICULTY_LEVELS } from './constants';
import type { Grade, Topic, Question, QuizResult, QuestionResult, Difficulty } from './types';
import { generateQuestions } from './services/questionService';
import { useStudentProfile } from './hooks/useStudentProfile';

const HISTORY_KEY = 'calculation-training-history';

// --- Helper Functions ---
const normalizeAnswer = (input: string): string => {
  const fullWidthMap: Record<string, string> = {
    '０': '0', '１': '1', '２': '2', '３': '3', '４': '4', '５': '5', '６': '6', '７': '7', '８': '8', '９': '9',
    'ａ': 'a', 'ｂ': 'b', 'ｃ': 'c', 'ｄ': 'd', 'ｅ': 'e', 'ｆ': 'f', 'ｇ': 'g', 'ｈ': 'h', 'ｉ': 'i', 'ｊ': 'j', 'ｋ': 'k', 'ｌ': 'l', 'ｍ': 'm', 'ｎ': 'n', 'ｏ': 'o', 'ｐ': 'p', 'ｑ': 'q', 'ｒ': 'r', 'ｓ': 's', 'ｔ': 't', 'ｕ': 'u', 'ｖ': 'v', 'ｗ': 'w', 'ｘ': 'x', 'ｙ': 'y', 'ｚ': 'z',
    'Ａ': 'a', 'Ｂ': 'b', 'Ｃ': 'c', 'Ｄ': 'd', 'Ｅ': 'e', 'Ｆ': 'f', 'Ｇ': 'g', 'Ｈ': 'h', 'Ｉ': 'i', 'Ｊ': 'j', 'Ｋ': 'k', 'Ｌ': 'l', 'Ｍ': 'm', 'Ｎ': 'n', 'Ｏ': 'o', 'Ｐ': 'p', 'Ｑ': 'q', 'Ｒ': 'r', 'Ｓ': 's', 'Ｔ': 't', 'Ｕ': 'u', 'Ｖ': 'v', 'Ｗ': 'w', 'Ｘ': 'x', 'Ｙ': 'y', 'Ｚ': 'z',
    '（': '(', '）': ')', '＋': '+', '－': '-', '＊': '*', '＝': '=', '，': ',', '．': '.', '／': '/', '：': ':', '＾': '^', '√': '√', 'π': 'π', '～': '-'
  };

  let normalized = input
    .split('')
    .map(char => fullWidthMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/sqrt/g, '√')
    .replace(/・/g, '*') // Standardize dot to asterisk
    .replace(/角/g, ''); // Remove "angle" symbol for proofs

  // Handle combined units by replacing the main unit with a comma
  // e.g., "2m50cm" -> "2,50", "5分30秒" -> "5,30"
  normalized = normalized
    .replace(/(\d+(?:\.\d+)?)\s*(?:m|メートル)\s*(\d+(?:\.\d+)?)\s*(?:cm|センチ)?/g, '$1,$2')
    .replace(/(\d+(?:\.\d+)?)\s*(?:kg|キログラム)\s*(\d+(?:\.\d+)?)\s*(?:g|グラム)?/g, '$1,$2')
    .replace(/(\d+(?:\.\d+)?)\s*(?:l|リットル)\s*(\d+(?:\.\d+)?)\s*(?:ml|ミリリットル)?/g, '$1,$2')
    .replace(/(\d+)\s*(?:分)\s*(\d+)\s*(?:秒)?/g, '$1,$2');

  // Standardize remainder format "あまり" or "r"
  normalized = normalized.replace(/あまり/g, 'r');

  // Strip common units from the end of single-value answers
  if (!normalized.includes(',')) {
    // Ordered from longest to shortest to prevent partial matches (e.g., cm² vs cm)
    const units = ['km/時', 'cm²', 'cm³', 'm²', '時間', 'km', 'cm', 'm', 'kg', 'g', 'l', 'ml', '分', '秒', '度', '円', '個', '人', '%'];
    for (const unit of units) {
      if (normalized.endsWith(unit)) {
        normalized = normalized.slice(0, -unit.length);
        break;
      }
    }
  }

  // For prime factorization like 2*3^2 or 3^2*2
  if (normalized.includes('*') && /^[0-9^*]+$/.test(normalized)) {
    return normalized.split('*').sort().join('*');
  }
  
  // For algebraic factorization like (x+2)(x-3) or (x-3)(x+2)
  const factors = normalized.match(/\([^)]+\)/g);
  if (factors && factors.length > 1 && factors.join('') === normalized) {
    return factors.sort().join('');
  }
  
  // Handle equality proofs like ac=df or df=ac
  if (normalized.includes('=')) {
      const parts = normalized.split('=');
      if (parts.length === 2 && !/^[xy]=/.test(normalized)) { // Avoid affecting equation answers like x=5
          // also sort characters within each part, so ca=df is same as ac=df
          const sortedParts = parts.map(p => p.split('').sort().join('')).sort();
          return sortedParts.join('=');
      }
  }

  return normalized;
};

const formatTime = (ms: number): string => {
    const totalSeconds = Math.round(ms / 1000);
    if (totalSeconds < 1) return "1秒未満";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    let timeStr = '';
    if (minutes > 0) timeStr += `${minutes}分`;
    if (seconds > 0) timeStr += `${seconds}秒`;
    return timeStr || '0秒';
};


// --- Components ---

const Header = ({ title, onHistoryClick, onProfileClick, onHomeClick, showHomeButton }: { title: string, onHistoryClick: () => void, onProfileClick: () => void, onHomeClick: () => void, showHomeButton: boolean }) => (
    <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h1>
                <div className="space-x-2 flex items-center">
                    {showHomeButton && (
                        <button onClick={onHomeClick} className="p-2 rounded-full hover:bg-slate-200 transition-colors" aria-label="トップに戻る">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3v-6a1 1 0 011-1h2a1 1 0 011 1v6h3a1 1 0 001-1V10l-7-7-7 7z" /></svg>
                        </button>
                    )}
                     <button onClick={onProfileClick} className="p-2 rounded-full hover:bg-slate-200 transition-colors" aria-label="プロフィール">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </button>
                    <button onClick={onHistoryClick} className="p-2 rounded-full hover:bg-slate-200 transition-colors" aria-label="学習履歴">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const Footer = () => (
    <footer className="text-center py-4 text-slate-500 text-sm">
        <p>&copy; 2024 計算トレーニング. All rights reserved.</p>
    </footer>
);


const BackButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
    <button onClick={onClick} className="mb-6 inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        {children}
    </button>
);

const GradeSelector = ({ onSelectGrade }: { onSelectGrade: (grade: Grade) => void }) => (
    <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-700">学年を選ぼう</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {GRADES.map((grade) => (
                <button
                    key={grade}
                    onClick={() => onSelectGrade(grade)}
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-sky-50 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
                >
                    <span className="text-lg font-bold text-sky-700">{grade}</span>
                </button>
            ))}
        </div>
    </div>
);

const TopicSelector = ({ topics, onSelectTopic, onBack }: { topics: Topic[], onSelectTopic: (topic: Topic) => void, onBack: () => void }) => (
    <div className="p-4 sm:p-6">
        <BackButton onClick={onBack}>学年選択に戻る</BackButton>
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-700">単元を選ぼう</h2>
        <div className="space-y-3">
            {topics.map((topic) => (
                <button
                    key={topic.id}
                    onClick={() => onSelectTopic(topic)}
                    className="w-full text-left p-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-indigo-50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                >
                    <span className="font-semibold text-indigo-800">{topic.name}</span>
                </button>
            ))}
        </div>
    </div>
);

const DifficultySelector = ({ onSelect, onBack }: { onSelect: (difficulty: Difficulty) => void, onBack: () => void }) => (
    <div className="p-4 sm:p-6">
        <BackButton onClick={onBack}>単元選択に戻る</BackButton>
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-700">難易度を選ぼう</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DIFFICULTY_LEVELS.map(({ id, name, description }) => (
                <button
                    key={id}
                    onClick={() => onSelect(id)}
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-emerald-50 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
                >
                    <span className="text-lg font-bold text-emerald-700">{name}</span>
                    <p className="text-sm text-slate-500 mt-1">{description}</p>
                </button>
            ))}
        </div>
    </div>
);


const NumQuestionsSelector = ({ onSelect, onBack, backLabel }: { onSelect: (num: number) => void; onBack: () => void; backLabel: string; }) => (
    <div className="p-4 sm:p-6">
        <BackButton onClick={onBack}>{backLabel}</BackButton>
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-700">問題数を選ぼう</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {NUM_QUESTIONS_OPTIONS.map(({ num, label, description }) => (
                <button
                    key={num}
                    onClick={() => onSelect(num)}
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-amber-50 transition-all transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
                >
                    <span className="text-lg font-bold text-amber-700">{label}</span>
                     <p className="text-sm text-slate-500 mt-1">{description}</p>
                </button>
            ))}
        </div>
    </div>
);


const Keypad = ({ onKeyPress }: { onKeyPress: (key: string) => void }) => {
    const keys = [
        '7', '8', '9', '(', ')', '/', '⌫',
        '4', '5', '6', '*', 'a', 'b', 'c',
        '1', '2', '3', '-', 'd', 'e', 'f',
        '0', '.', ',', '+', 'x', 'y', 'r',
        '√', 'π', '^', ':', '=', 'OK'
    ];

    return (
        <div className="grid grid-cols-7 gap-2 p-2 bg-slate-200 rounded-lg mt-4">
            {keys.map(key => {
                 const isOk = key === 'OK';
                 const isBackspace = key === '⌫';
                 const isSymbol = ['(', ')', '/', '*', '-', '+', ',', '^', ':', '=', '√', 'π', '.'].includes(key);
                 const isLetter = ['a','b','c','d','e','f','r','x','y'].includes(key);

                return (
                    <button
                        key={key}
                        onClick={() => onKeyPress(key)}
                        className={`h-12 rounded-lg text-xl font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-md active:shadow-inner active:translate-y-px
                            ${isOk ? 'col-span-2 bg-sky-500 text-white hover:bg-sky-600' : ''}
                            ${isBackspace ? 'bg-rose-500 text-white hover:bg-rose-600' : ''}
                            ${isSymbol ? 'bg-slate-100 text-slate-800' : ''}
                            ${isLetter ? 'bg-indigo-100 text-indigo-800' : ''}
                            ${!isOk && !isBackspace && !isSymbol && !isLetter ? 'bg-white text-slate-700 hover:bg-slate-50' : ''}
                        `}
                    >
                        {key}
                    </button>
                );
            })}
        </div>
    );
};

const Quiz = ({
    questions,
    onQuizComplete,
    topicName,
    onBack,
}: {
    questions: Question[],
    onQuizComplete: (results: QuestionResult[]) => void,
    topicName: string,
    onBack: () => void;
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isWrong, setIsWrong] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [results, setResults] = useState<QuestionResult[]>([]);
    const [inputMode, setInputMode] = useState<'keypad' | 'keyboard'>('keypad');
    const inputRef = useRef<HTMLInputElement>(null);
    
    const currentQuestion = questions[currentQuestionIndex];

    const toggleInputMode = () => {
        setInputMode(prev => (prev === 'keypad' ? 'keyboard' : 'keypad'));
    };

    useEffect(() => {
        if (inputMode === 'keyboard' && !showExplanation) {
            inputRef.current?.focus();
        }
    }, [currentQuestionIndex, showExplanation, inputMode]);

    const handleKeypadPress = (key: string) => {
        if (showExplanation) return;

        if (key === 'OK') {
            handleSubmit();
        } else if (key === '⌫') {
            setUserAnswer(prev => prev.slice(0, -1));
        } else {
            setUserAnswer(prev => prev + key);
        }
    };
    
    const handleSubmit = () => {
        if (showExplanation || !userAnswer.trim()) return;

        const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(currentQuestion.answer);

        if (isCorrect) {
            setResults(prev => [...prev, { question: currentQuestion, attempts, isCorrect: true, isSkipped: false }]);
            setShowExplanation(true);
        } else {
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 500);
            
            if (attempts + 1 >= MAX_ATTEMPTS) {
                setResults(prev => [...prev, { question: currentQuestion, attempts: MAX_ATTEMPTS, isCorrect: false, isSkipped: false }]);
                setShowExplanation(true);
            } else {
                setAttempts(prev => prev + 1);
            }
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setUserAnswer('');
            setAttempts(0);
            setShowExplanation(false);
            setInputMode('keypad'); // Reset to keypad for next question
        } else {
            onQuizComplete(results);
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showExplanation && e.key === 'Enter') {
                handleNext();
            } else if (!showExplanation && e.key === 'Enter') {
                if (document.activeElement === inputRef.current && e.isComposing) {
                    return; // Don't submit while composing with an IME
                }
                handleSubmit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showExplanation, userAnswer, currentQuestionIndex]);

    if (!currentQuestion) {
        return <div className="p-4 text-center">問題の読み込みに失敗しました。</div>;
    }
    
    if (currentQuestion.id === -1) {
         return (
            <div className="p-6 text-center">
                <p className="text-lg text-slate-700 mb-4">{currentQuestion.text}</p>
                <button
                    onClick={() => onQuizComplete([])}
                    className="px-6 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-colors"
                >
                    戻る
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <button onClick={onBack} className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     問題数選択に戻る
                </button>
            </div>
            <div className="text-sm text-slate-500 mb-2">{topicName}</div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">
                    第{currentQuestionIndex + 1}問
                </h2>
                <div className="text-sm font-semibold text-slate-600 bg-slate-200 px-3 py-1 rounded-full">
                    {currentQuestionIndex + 1} / {questions.length}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg min-h-[120px] flex items-center justify-center text-center">
                <div>
                  <p className="text-2xl sm:text-3xl font-mono text-slate-800" dangerouslySetInnerHTML={{ __html: currentQuestion.text.replace(/\^(\d+)/g, '<sup>$1</sup>') }}/>
                  {currentQuestion.figure && <div className="mt-4 flex justify-center">{currentQuestion.figure}</div>}
                </div>
            </div>

            <div className="mt-6">
                <div className="flex justify-end mb-2">
                    <button
                        onClick={toggleInputMode}
                        className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
                        aria-label={inputMode === 'keypad' ? "キーボード入力に切り替える" : "キーパッド入力に切り替える"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V8zM5 8a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H9a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM5 12a1 1 0 011-1h7a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                        {inputMode === 'keypad' ? 'キーボード入力' : 'キーパッド入力'}
                    </button>
                </div>
                <div className={`relative ${isWrong ? 'animate-shake' : ''}`}>
                     <input
                        ref={inputRef}
                        type="text"
                        value={userAnswer}
                        readOnly={inputMode === 'keypad'}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="ここに答えを入力"
                        aria-label="解答入力欄"
                        className="w-full p-4 text-lg border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-center"
                    />
                </div>
                {inputMode === 'keypad' && <Keypad onKeyPress={handleKeypadPress} />}
                 {inputMode === 'keyboard' && (
                    <button
                        onClick={handleSubmit}
                        disabled={showExplanation || !userAnswer.trim()}
                        className="mt-4 w-full px-4 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        OK
                    </button>
                )}
            </div>

            {showExplanation && (
                <div className="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                    <h3 className="font-bold text-lg mb-2 text-emerald-800">
                        {results[results.length-1].isCorrect ? '正解！' : `正解は: ${currentQuestion.answer.replace(/\*/g, '×')}`}
                    </h3>
                    <p className="text-slate-700">{currentQuestion.explanation}</p>
                    <button onClick={handleNext} className="mt-4 w-full px-4 py-3 bg-emerald-500 text-white font-bold rounded-lg shadow-md hover:bg-emerald-600 transition-colors">
                        {currentQuestionIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}
                    </button>
                </div>
            )}
        </div>
    );
};

const ResultsScreen = ({ result, onRetry, onBackToTop }: { result: QuizResult, onRetry: () => void, onBackToTop: () => void }) => {
    const { results, startTime, endTime, grade, topic, difficulty } = result;
    const totalQuestions = results.length;
    
    if (totalQuestions === 0) {
        return (
             <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-slate-700 mb-4">エラー</h2>
                <p className="mb-6">問題がありませんでした。トップに戻ってください。</p>
                <button onClick={onBackToTop} className="px-6 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-colors">トップに戻る</button>
            </div>
        )
    }

    const correctAnswers = results.filter(r => r.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const timeTaken = Math.round((endTime - startTime) / 1000);
    
    const encouragement = useMemo(() => {
        if (score === 100) return ENCOURAGEMENT_MESSAGES.perfect;
        if (score >= 80) return ENCOURAGEMENT_MESSAGES.great;
        if (score >= 60) return ENCOURAGEMENT_MESSAGES.good;
        return ENCOURAGEMENT_MESSAGES.effort;
    }, [score]);

    return (
        <div className="p-4 sm:p-6 text-center">
            <h2 className="text-3xl font-black text-slate-700 mb-2">結果発表</h2>
            <p className="text-slate-500 mb-6">{grade} - {topic.name} {difficulty && `(${difficulty})`}</p>
            
            <div className="mb-6">
                <p className="text-xl font-bold text-sky-600">{encouragement}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                 <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-slate-500">スコア</p>
                    <p className="text-3xl font-bold text-slate-800">{score}<span className="text-lg font-medium">%</span></p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-slate-500">正解数</p>
                    <p className="text-3xl font-bold text-slate-800">{correctAnswers} / {totalQuestions}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-slate-500">タイム</p>
                    <p className="text-3xl font-bold text-slate-800">{timeTaken}<span className="text-lg font-medium">秒</span></p>
                </div>
            </div>

            <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4 justify-center">
                <button onClick={onRetry} className="w-full sm:w-auto px-8 py-3 bg-sky-500 text-white font-bold rounded-lg shadow-md hover:bg-sky-600 transition-all transform hover:-translate-y-0.5 active:translate-y-0">もう一度挑戦</button>
                <button onClick={onBackToTop} className="w-full sm:w-auto px-8 py-3 bg-slate-600 text-white font-bold rounded-lg shadow-md hover:bg-slate-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0">トップに戻る</button>
            </div>
        </div>
    );
};

const HistoryScreen = ({ history, onBack, onClearHistory }: { history: QuizResult[], onBack: () => void, onClearHistory: () => void }) => {
    const groupedHistory = useMemo(() => {
        const groups: Record<string, { results: QuizResult[], totalTime: number }> = {};
        history.forEach(result => {
            const dateStr = new Date(result.endTime).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
            if (!groups[dateStr]) {
                groups[dateStr] = { results: [], totalTime: 0 };
            }
            groups[dateStr].results.push(result);
            const timeTaken = result.endTime - result.startTime;
            if (timeTaken > 0) {
                 groups[dateStr].totalTime += timeTaken;
            }
        });
        return Object.entries(groups);
    }, [history]);

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <BackButton onClick={onBack}>トップに戻る</BackButton>
                {history.length > 0 && 
                    <button onClick={onClearHistory} className="text-sm text-red-500 hover:text-red-700 font-medium">履歴を消去</button>
                }
            </div>
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-700">学習履歴</h2>
            {history.length === 0 ? (
                <p className="text-center text-slate-500">まだ学習履歴がありません。</p>
            ) : (
                <div className="space-y-6">
                    {groupedHistory.map(([date, groupData]) => (
                        <div key={date}>
                            <div className="flex justify-between items-baseline pb-2 border-b border-slate-200 mb-3">
                                <h3 className="font-bold text-lg text-slate-600">{date}</h3>
                                <p className="text-sm font-semibold text-slate-500">合計: <span className="text-base text-sky-600 font-bold">{formatTime(groupData.totalTime)}</span></p>
                            </div>
                            <div className="space-y-4">
                                {groupData.results.map((result, index) => {
                                    const correctCount = result.results.filter(r => r.isCorrect).length;
                                    const total = result.results.length;
                                    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
                                    const timeTaken = result.endTime - result.startTime;
                                    return (
                                        <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs text-slate-500">{new Date(result.endTime).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    <p className="font-semibold text-slate-800">{result.topic.name}
                                                       {result.difficulty && <span className="ml-2 text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{result.difficulty}</span>}
                                                    </p>
                                                    <p className="text-sm text-slate-500 mt-1">🕒 {formatTime(timeTaken)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-xl font-bold ${score === 100 ? 'text-amber-500' : 'text-slate-700'}`}>{score}%</p>
                                                    <p className="text-sm text-slate-600">{correctCount} / {total} 問</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const ProfileScreen = ({ studentName, updateStudentName, consecutiveDays, onBack }: { studentName: string, updateStudentName: (name: string) => void, consecutiveDays: number, onBack: () => void }) => {
    const [name, setName] = useState(studentName);
    
    const handleSave = () => {
        updateStudentName(name);
        alert('名前を保存しました！');
    };

    return (
        <div className="p-4 sm:p-6">
            <BackButton onClick={onBack}>トップに戻る</BackButton>
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-700">プロフィール</h2>
            
             <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
                <div className="mb-6 text-center">
                    <p className="text-slate-600">連続学習日数</p>
                    <p className="text-5xl font-bold text-sky-500">{consecutiveDays} <span className="text-2xl">日</span></p>
                </div>
                <div className="mb-4">
                    <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 mb-1">名前</label>
                    <input
                        id="studentName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="名前を入力"
                        className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
                <button onClick={handleSave} className="w-full px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-colors">保存する</button>
            </div>
        </div>
    );
};

// --- Main App Component ---
type Screen = 'grade' | 'topic' | 'difficulty' | 'num_questions' | 'quiz' | 'result' | 'history' | 'profile';

// --- Navigation State Management (useReducer) ---
type NavState = {
  screen: Screen;
};

type NavAction =
  | { type: 'NAVIGATE'; to: Screen }
  | { type: 'RESET' };

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'NAVIGATE':
      return { screen: action.to };
    case 'RESET':
      return { screen: 'grade' };
    default:
      return state;
  }
}


const App = () => {
    const [nav, dispatch] = useReducer(navReducer, {
        screen: 'grade',
    });
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [quizStartTime, setQuizStartTime] = useState<number>(0);
    const [history, setHistory] = useState<QuizResult[]>([]);
    const { studentName, updateStudentName, consecutiveDays, updateConsecutiveDays } = useStudentProfile();

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_KEY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage:", error);
            setHistory([]);
        }
    }, []);

    useEffect(() => {
        updateConsecutiveDays(history);
    }, [history, updateConsecutiveDays]);

    const resetSelection = useCallback(() => {
        setSelectedGrade(null);
        setSelectedTopic(null);
        setDifficulty(null);
        setQuestions([]);
        setQuizResult(null);
    }, []);

    const navigate = (to: Screen) => {
        if (to === 'grade') {
            resetSelection();
            dispatch({ type: 'RESET' });
        } else {
            dispatch({ type: 'NAVIGATE', to: to });
        }
    };

    const handleSelectGrade = (grade: Grade) => {
        setSelectedGrade(grade);
        navigate('topic');
    };

    const handleStartQuiz = (num: number) => {
        if (!selectedTopic) return;
        const generatedQuestions = generateQuestions(selectedTopic, num, difficulty);
        setQuestions(generatedQuestions);
        setQuizStartTime(Date.now());
        dispatch({ type: 'NAVIGATE', to: 'quiz' });
    };

    const handleQuizComplete = (results: QuestionResult[]) => {
        if (!selectedGrade || !selectedTopic) {
             navigate('grade');
             return;
        };

        if (results.length > 0) {
            const newResult: QuizResult = {
                grade: selectedGrade,
                topic: selectedTopic,
                difficulty: difficulty,
                results,
                startTime: quizStartTime,
                endTime: Date.now(),
            };
            setQuizResult(newResult);
            
            setHistory(prev => {
                const newHistory = [newResult, ...prev];
                if (newHistory.length > MAX_HISTORY_ENTRIES) {
                    newHistory.pop();
                }
                try {
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
                } catch(error) {
                    console.error("Failed to save history to localStorage:", error);
                }
                return newHistory;
            });
        }

        navigate('result');
    };
    
    const handleClearHistory = () => {
        if(window.confirm('本当にすべての学習履歴を削除しますか？')) {
            setHistory([]);
            localStorage.removeItem(HISTORY_KEY);
        }
    }
    
    const handleRetry = () => {
        if (!selectedTopic || questions.length === 0) {
            navigate('grade');
            return;
        }
        setQuizStartTime(Date.now());
        dispatch({ type: 'NAVIGATE', to: 'quiz' });
    };

    const getScreenTitle = () => {
        switch(nav.screen) {
            case 'history': return '学習履歴';
            case 'profile': return 'プロフィール';
            default: return `計算トレーニング ${studentName ? `| ${studentName}さん` : ''}`;
        }
    }

    const renderScreen = () => {
        switch (nav.screen) {
            case 'grade':
                return <GradeSelector onSelectGrade={handleSelectGrade} />;
            case 'topic':
                return selectedGrade && <TopicSelector topics={TOPICS_BY_GRADE[selectedGrade]} onSelectTopic={(topic) => {
                    setSelectedTopic(topic);
                    if (['小4', '小5', '小6', '中1', '中2', '中3'].includes(selectedGrade)) {
                        navigate('difficulty');
                    } else {
                        setDifficulty(null);
                        navigate('num_questions');
                    }
                }} onBack={() => navigate('grade')} />;
            case 'difficulty':
                return <DifficultySelector onSelect={(diff) => {
                    setDifficulty(diff);
                    navigate('num_questions');
                }} onBack={() => navigate('topic')} />;
            case 'num_questions':
                 const backLabel = ['小4', '小5', '小6', '中1', '中2', '中3'].includes(selectedGrade || '') ? '難易度選択に戻る' : '単元選択に戻る';
                 return <NumQuestionsSelector onSelect={handleStartQuiz} onBack={() => {
                      if (['小4', '小5', '小6', '中1', '中2', '中3'].includes(selectedGrade || '')) {
                          navigate('difficulty');
                      } else {
                          navigate('topic');
                      }
                 }} backLabel={backLabel} />;
            case 'quiz':
                return questions.length > 0 && selectedTopic ? <Quiz questions={questions} onQuizComplete={handleQuizComplete} topicName={selectedTopic.name} onBack={() => navigate('num_questions')} /> : <div>Loading...</div>;
            case 'result':
                return quizResult && <ResultsScreen result={quizResult} onRetry={handleRetry} onBackToTop={() => navigate('grade')} />;
            case 'history':
                return <HistoryScreen history={history} onBack={() => navigate('grade')} onClearHistory={handleClearHistory} />;
            case 'profile':
                return <ProfileScreen studentName={studentName} updateStudentName={updateStudentName} consecutiveDays={consecutiveDays} onBack={() => navigate('grade')} />;
            default:
                return <div>Error</div>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header 
                title={getScreenTitle()} 
                onHistoryClick={() => navigate('history')} 
                onProfileClick={() => navigate('profile')}
                onHomeClick={() => navigate('grade')}
                showHomeButton={nav.screen !== 'grade'}
            />
            <main className="flex-grow container mx-auto max-w-4xl">
                 <div className="bg-slate-50 rounded-lg shadow-inner m-2 sm:m-4">
                    {renderScreen()}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;