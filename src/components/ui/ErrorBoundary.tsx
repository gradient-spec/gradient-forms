import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '';
    window.location.search = '';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] p-6 md:p-12 flex items-center justify-center">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#121820] border border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)] text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold font-heading text-white">
                {this.props.fallbackTitle || 'Workspace View Interrupted'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected state occurred while rendering this view. Your form data is saved safely in your browser storage.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-lg bg-[#0B0F14] border border-[#2A3647] text-[11px] font-mono text-rose-300 text-left truncate">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-neo cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry View</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A2332] hover:bg-[#222C3D] border border-[#2A3647] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Back to Forms</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
