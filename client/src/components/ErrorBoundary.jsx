import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CareSync ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-mist flex items-center justify-center p-6 text-center">
          <div className="max-w-lg bg-paper p-8 rounded-clinic shadow-neumorph border border-alert/30">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-alert">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-ink mb-2">Something went wrong</h2>
            <p className="text-xs text-sage mb-4">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest text-white text-xs font-bold shadow-sm hover:bg-evergreen transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Cache & Reload App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
