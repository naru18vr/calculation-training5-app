import { useState, useCallback, useMemo, useRef } from 'react';
import type { QuizResult, StudentProfile } from '../types';
import { ACTIVE_PROFILE_KEY, DEFAULT_PROFILES, PROFILES_KEY, isValidLocalDateKey, loadProfiles, safeStorageSet } from '../services/profileService';

const getLocalDayNumber = (date: Date): number =>
    Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);

export const calculateStreak = (history: QuizResult[], now = new Date()): number => {
    const today = getLocalDayNumber(now);
    const studyDays = [...new Set(history.map(result => getLocalDayNumber(new Date(result.endTime))))]
        .filter(day => day <= today)
        .sort((a, b) => b - a);
    if (studyDays.length === 0) return 0;

    if (studyDays[0] < today - 1) return 0;

    let streak = 1;
    for (let index = 1; index < studyDays.length; index++) {
        if (studyDays[index - 1] - studyDays[index] !== 1) break;
        streak++;
    }
    return streak;
};

export const useStudentProfile = (history: QuizResult[]) => {
    const [profiles, setProfiles] = useState<StudentProfile[]>(loadProfiles);
    const profilesRef = useRef(profiles);
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

    const selectProfile = useCallback((profileId: StudentProfile['id']): boolean => {
        setActiveProfileId(profileId);
        return safeStorageSet(ACTIVE_PROFILE_KEY, profileId);
    }, []);

    const updateStudentName = useCallback((newName: string): boolean => {
        const updated = profilesRef.current.map(profile => profile.id === activeProfileId
            ? { ...profile, name: newName.trim() || profile.startGrade }
            : profile);
        profilesRef.current = updated;
        setProfiles(updated);
        return safeStorageSet(PROFILES_KEY, JSON.stringify(updated));
    }, [activeProfileId]);

    const updateDailyGoal = useCallback((dailyGoal: number): boolean => {
        const updated = profilesRef.current.map(profile => profile.id === activeProfileId ? { ...profile, dailyGoal } : profile);
        profilesRef.current = updated;
        setProfiles(updated);
        return safeStorageSet(PROFILES_KEY, JSON.stringify(updated));
    }, [activeProfileId]);

    const updateExamSettings = useCallback((examDate: string, targetScore: number): boolean => {
        const safeExamDate = examDate && isValidLocalDateKey(examDate) ? examDate : undefined;
        const updated = profilesRef.current.map(profile => profile.id === activeProfileId
            ? { ...profile, examDate: safeExamDate, targetScore }
            : profile);
        profilesRef.current = updated;
        setProfiles(updated);
        return safeStorageSet(PROFILES_KEY, JSON.stringify(updated));
    }, [activeProfileId]);

    return { profiles, activeProfile, activeHistory, selectProfile, updateStudentName, updateDailyGoal, updateExamSettings, consecutiveDays };
};
