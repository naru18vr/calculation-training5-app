import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_PROFILES, PROFILES_KEY, loadProfiles, normalizeProfiles, safeStorageSet } from './profileService';

describe('profile service', () => {
    it('repairs empty and incomplete saved profiles', () => {
        expect(normalizeProfiles([])).toEqual(DEFAULT_PROFILES);
        const profiles = normalizeProfiles([{ id: 'grade5', name: '  花子  ', dailyGoal: 999 }]);
        expect(profiles).toHaveLength(2);
        expect(profiles[0]).toMatchObject({ id: 'grade5', name: '花子', startGrade: '小5', dailyGoal: 100 });
        expect(profiles[1]).toEqual(DEFAULT_PROFILES[1]);
    });

    it('falls back safely when stored JSON is damaged', () => {
        const storage = { getItem: vi.fn((key: string) => key === PROFILES_KEY ? '{broken' : null) };
        expect(loadProfiles(storage)).toEqual(DEFAULT_PROFILES);
    });

    it('continues when browser storage cannot be written', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const storage = { setItem: vi.fn(() => { throw new Error('quota'); }) };
        expect(safeStorageSet('key', 'value', storage)).toBe(false);
        consoleSpy.mockRestore();
    });
});
