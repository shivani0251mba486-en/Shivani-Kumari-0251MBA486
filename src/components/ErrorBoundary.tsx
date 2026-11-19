import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let friendlyMessage =
        'Something went wrong while syncing your SolarSewa data. Please reload and try again.';
      try {
        const parsed = JSON.parse(this.state.errorMessage) as {
          error?: string;
          operationType?: string;
        };
        if (parsed?.error?.toLowerCase().includes('permission')) {
          friendlyMessage =
            'Access denied by Firestore security rules. Please make sure you are signed in with a verified Google account.';
        } else if (parsed?.error) {
          friendlyMessage = parsed.error;
        }
      } catch {
        if (this.state.errorMessage) {
          friendlyMessage = this.state.errorMessage;
        }
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6">
            <h1 className="font-display text-lg font-bold text-slate-900">
              Unable to complete request
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{friendlyMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Reload SolarSewa
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
