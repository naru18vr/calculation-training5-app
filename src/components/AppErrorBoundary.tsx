import React from 'react';

interface State {
    hasError: boolean;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: unknown, info: React.ErrorInfo) {
        console.error('Unexpected application error:', error, info);
    }

    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <main className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
                <section className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-lg" role="alert">
                    <div className="text-4xl" aria-hidden="true">⚠️</div>
                    <h1 className="mt-3 text-xl font-bold text-slate-800">画面の読み込みで問題が起きました</h1>
                    <p className="mt-3 text-base text-slate-600">学習記録は消していません。もう一度読み込むと続けられます。</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-6 min-h-12 w-full rounded-xl bg-sky-600 px-5 py-3 text-base font-bold text-white hover:bg-sky-700"
                    >
                        もう一度読み込む
                    </button>
                </section>
            </main>
        );
    }
}
