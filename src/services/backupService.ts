const BACKUP_KEYS = [
    'calculation-training-history',
    'calculation-training-student-profiles-v2',
    'calculation-training-active-profile-v2',
    'calculation-training-reports-v1',
] as const;

export interface BackupData {
    app: 'calculation-training5-app';
    version: 1;
    exportedAt: string;
    data: Record<string, string | null>;
}

type BackupStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const JSON_KEYS = new Set<string>([
    'calculation-training-history',
    'calculation-training-student-profiles-v2',
    'calculation-training-reports-v1',
]);

export const validateBackupData = (value: unknown): BackupData => {
    if (!value || typeof value !== 'object') throw new Error('バックアップファイルを読み取れません。');
    const parsed = value as Partial<BackupData>;
    if (parsed.app !== 'calculation-training5-app' || parsed.version !== 1 || !parsed.data || typeof parsed.data !== 'object') {
        throw new Error('このアプリのバックアップファイルではありません。');
    }
    for (const key of BACKUP_KEYS) {
        const item = parsed.data[key];
        if (item !== null && typeof item !== 'string') throw new Error('バックアップの保存データが壊れています。');
        if (typeof item === 'string' && JSON_KEYS.has(key)) {
            try {
                JSON.parse(item);
            } catch {
                throw new Error('バックアップの保存データが壊れています。');
            }
        }
    }
    return parsed as BackupData;
};

export const restoreBackupData = (backup: BackupData, storage: BackupStorage = localStorage) => {
    const previous = Object.fromEntries(BACKUP_KEYS.map(key => [key, storage.getItem(key)])) as Record<string, string | null>;
    try {
        BACKUP_KEYS.forEach(key => {
            const value = backup.data[key];
            if (typeof value === 'string') storage.setItem(key, value);
            else storage.removeItem(key);
        });
    } catch (error) {
        BACKUP_KEYS.forEach(key => {
            try {
                const value = previous[key];
                if (typeof value === 'string') storage.setItem(key, value);
                else storage.removeItem(key);
            } catch {
                // Continue rolling back other keys even when storage is unavailable.
            }
        });
        console.error('Backup restore failed and was rolled back:', error);
        throw new Error('復元できませんでした。元の学習記録は変更していません。');
    }
};

export const downloadBackup = () => {
    const backup: BackupData = {
        app: 'calculation-training5-app',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: Object.fromEntries(BACKUP_KEYS.map(key => [key, localStorage.getItem(key)])),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `math-training-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
};

export const restoreBackup = async (file: File) => {
    let raw: unknown;
    try {
        raw = JSON.parse(await file.text());
    } catch {
        throw new Error('バックアップファイルを読み取れません。');
    }
    restoreBackupData(validateBackupData(raw));
};
