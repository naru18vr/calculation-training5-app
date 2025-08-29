import { useState, useCallback, useEffect } from 'react';
import type { QuizResult } from '../types';

const NAME_KEY = 'calculation-training-student-name';
const CONSECUTIVE_DAYS_KEY = 'calculation-training-consecutive-days';
const LAST_STUDY_DAY_KEY = 'calculation-training-last-study-day';

const getStartOfDay = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

export const useStudentProfile = () => {
    const [studentName, setStudentName] = useState<string>(() => localStorage.getItem(NAME_KEY) || '');
    const [consecutiveDays, setConsecutiveDays] = useState<number>(() => parseInt(localStorage.getItem(CONSECUTIVE_DAYS_KEY) || '0', 10));
    
    const updateStudentName = useCallback((newName: string) => {
        setStudentName(newName);
        localStorage.setItem(NAME_KEY, newName);
    }, []);

    const updateConsecutiveDays = useCallback((history: QuizResult[]) => {
        if (history.length === 0) {
            setConsecutiveDays(0);
            localStorage.setItem(CONSECUTIVE_DAYS_KEY, '0');
            return;
        }

        const lastStudyTime = history[0].endTime;
        const today = getStartOfDay(new Date());
        const lastStudyDay = getStartOfDay(new Date(lastStudyTime));
        const prevLastStudyDay = getStartOfDay(new Date(parseInt(localStorage.getItem(LAST_STUDY_DAY_KEY) || '0', 10)));
        const yesterday = getStartOfDay(new Date(new Date().setDate(new Date().getDate() - 1)));

        let currentStreak = parseInt(localStorage.getItem(CONSECUTIVE_DAYS_KEY) || '0', 10);
        
        if (lastStudyDay === today) {
            // Already studied today, don't change streak unless it's the very first day
             if (currentStreak === 0) {
                 currentStreak = 1;
             } else if (prevLastStudyDay !== today) {
                // Studied today for the first time
                if(prevLastStudyDay === yesterday) {
                     currentStreak++;
                } else {
                     currentStreak = 1; // Streak was broken
                }
             }
        } else if (lastStudyDay === yesterday) {
            currentStreak++;
        } else {
            currentStreak = 1; // Streak was broken before today
        }
        
        setConsecutiveDays(currentStreak);
        localStorage.setItem(CONSECUTIVE_DAYS_KEY, currentStreak.toString());
        localStorage.setItem(LAST_STUDY_DAY_KEY, lastStudyDay.toString());

    }, []);
    
    // Check if streak should be reset on app load
    useEffect(() => {
        const lastDay = parseInt(localStorage.getItem(LAST_STUDY_DAY_KEY) || '0', 10);
        if(!lastDay) return;

        const today = getStartOfDay(new Date());
        const yesterday = getStartOfDay(new Date(new Date().setDate(new Date().getDate() - 1)));

        if(lastDay < yesterday) {
            setConsecutiveDays(0);
            localStorage.setItem(CONSECUTIVE_DAYS_KEY, '0');
        }
    },[]);


    return { studentName, updateStudentName, consecutiveDays, updateConsecutiveDays };
};
