import { describe, expect, it } from 'vitest';
import { TOPICS_BY_GRADE } from '../constants';
import type { StudentProfile } from '../types';
import { getProfileCourseGrades, hasSpecificLessonContent } from './learningService';

describe('profile course grades', () => {
    it('provides dedicated learning guidance for every topic', () => {
        const topics = Object.values(TOPICS_BY_GRADE).flat();
        expect(topics.filter(topic => !hasSpecificLessonContent(topic))).toEqual([]);
    });
    it('includes grade 4 review for the grade 5 learner', () => {
        const profile: StudentProfile = { id: 'grade5', name: '小5', startGrade: '小5', dailyGoal: 10 };
        expect(getProfileCourseGrades(profile)).toEqual(['小4', '小5', '小6', '中1', '中2', '中3']);
    });

    it('includes middle 1 review for the middle 2 learner', () => {
        const profile: StudentProfile = { id: 'middle2', name: '中2', startGrade: '中2', dailyGoal: 10 };
        expect(getProfileCourseGrades(profile)).toEqual(['中1', '中2', '中3']);
    });
});
