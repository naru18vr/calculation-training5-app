const BACKUP_KEYS = [
    'calculation-training-history',
    'calculation-training-student-profiles-v2',
    'calculation-training-active-profile-v2',
] as const;

interface BackupData {
    app: 'calculation-training5-app';
    version: 1;
    exportedAt: string;
    data: Record<string, string | null>;
}

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
    const parsed = JSON.parse(await file.text()) as Partial<BackupData>;
    if (parsed.app !== 'calculation-training5-app' || parsed.version !== 1 || !parsed.data) {
        throw new Error('このアプリのバックアップファイルではありません。');
    }
    BACKUP_KEYS.forEach(key => {
        const value = parsed.data?.[key];
        if (typeof value === 'string') localStorage.setItem(key, value);
        else localStorage.removeItem(key);
    });
};
