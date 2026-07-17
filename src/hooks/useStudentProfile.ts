import { useState, useCallback, useMemo } from 'react';
import type { QuizResult, StudentProfile } from '../types';
import { ACTIVE_PROFILE_KEY, DEFAULT_PROFILES, PROFILES_KEY, loadProfiles, safeStorageSet } from '../services/profileService';

const getStartOfDay = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

const calculateStreak = (history: QuizResult[]): number => {
    const studyDays = [...new Set(history.map(result => getStartOfDay(new Date(result.endTime))))]
        .sort((a, b) => b - a);
    if (studyDays.length === 0) return 0;

    const today = getStartOfDay(new Date());
    const oneDay = 24 * 60 * 60 * 1000;
    if (studyDays[0] < today - oneDay) return 0;

    let streak = 1;
    for (let index = 1; index < studyDays.length; index++) {
        if (studyDays[index - 1] - studyDays[index] !== oneDay) break;
        streak++;
    }
    return streak;
};

export const useStudentProfile = (history: QuizResult[]) => {
    const [profiles, setProfiles] = useState<StudentProfile[]>(loadProfiles);
    const [activeProfileId, setActiveProfileId] = useState<StudentProfile['id']>(() => {
        try {
            return localStorage.getItem(ACTIVE_PROFILE_KEY) === 'middle2' ? 'middle2' : 'grade5';
        } catch {
            return 'grade5';
        }
    });

    const activeProfile = profiles.find(profile => profile.id === activeProfileId) ?? profiles[0] ?? DEFAULT_PROFILES[0];
    const activeHistory = useMemo(
        () => history.filter(result => (result.studentId ?? 'grade5') === activeProfile.id),
        [activeProfile.id, history],
    );
    const consecutiveDays = useMemo(() => calculateStreak(activeHistory), [activeHistory]);

    const selectProfile = useCallback((profileId: StudentProfile['id']) => {
        setActiveProfileId(profileId);
        safeStorageSet(ACTIVE_PROFILE_KEY, profileId);
    }, []);

    const updateStudentName = useCallback((newName: string) => {
        setProfiles(current => {
            const updated = current.map(profile => profile.id === activeProfileId
                ? { ...profile, name: newName.trim() || profile.startGrade }
                : profile);
            safeStorageSet(PROFILES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, [activeProfileId]);

    const updateDailyGoal = useCallback((dailyGoal: number) => {
        setProfiles(current => {
            const updated = current.map(profile => profile.id === activeProfileId ? { ...profile, dailyGoal } : profile);
            safeStorageSet(PROFILES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, [activeProfileId]);

    const updateExamSettings = useCallback((examDate: string, targetScore: number) => {
        setProfiles(current => {
            const updated = current.map(profile => profile.id === activeProfileId
                ? { ...profile, examDate: examDate || undefined, targetScore }
                : profile);
            safeStorageSet(PROFILES_KEY, JSON.stringify(updated));
            return updated;
        });
    }, [activeProfileId]);

    return { profiles, activeProfile, activeHistory, selectProfile, updateStudentName, updateDailyGoal, updateExamSettings, consecutiveDays };
};
