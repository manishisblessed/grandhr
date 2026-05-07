import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { captureException } from '../../lib/sentry';

/**
 * Top-level error boundary. Catches render-time errors anywhere in the tree,
 * reports them to Sentry (if configured), and shows a brand-aligned fallback
 * with one-click recovery actions instead of a blank screen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    try {
      captureException(error, { componentStack: info?.componentStack });
    } catch {
      /* sentry is optional */
    }
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info);
    }
  }

  handleReset = () => {
    this.setState({ error: null, info: null });
    if (typeof window !== 'undefined') window.location.reload();
  };

  handleHome = () => {
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/40">
        <div className="max-w-lg w-full glass rounded-2xl p-8 text-center shadow-xl">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 grid place-items-center mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-6">
            The app hit an unexpected error. We&rsquo;ve logged the issue — try reloading the page or
            going back to the dashboard.
          </p>
          {import.meta.env.DEV && this.state.error?.message ? (
            <pre className="text-xs text-left bg-muted/40 rounded-lg p-3 mb-4 max-h-40 overflow-auto whitespace-pre-wrap break-words">
              {String(this.state.error.message)}
            </pre>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              <RefreshCcw className="w-4 h-4" /> Reload
            </button>
            <button
              onClick={this.handleHome}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted/40 transition"
            >
              <Home className="w-4 h-4" /> Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
