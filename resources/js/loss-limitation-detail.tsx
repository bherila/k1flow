import { createRoot } from 'react-dom/client';
import React from 'react';
import AtRiskDetail from './components/k1/loss-limitations/AtRiskDetail';
import PassiveActivityDetail from './components/k1/loss-limitations/PassiveActivityDetail';
import ExcessBusinessLossDetail from './components/k1/loss-limitations/ExcessBusinessLossDetail';
import NetOperatingLossDetail from './components/k1/loss-limitations/NetOperatingLossDetail';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[LossLimitationDetail] Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded m-4">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <pre className="text-sm whitespace-pre-wrap font-mono">{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const mount = document.getElementById('loss-limitation-detail');

if (mount) {
  const interestId = parseInt(mount.dataset.interestId || '0', 10);
  const year = parseInt(mount.dataset.year || '0', 10);
  const type = mount.dataset.type || '';
  
  let Component;
  switch (type) {
      case 'at-risk':
          Component = AtRiskDetail;
          break;
      case 'passive-activity':
          Component = PassiveActivityDetail;
          break;
      case 'excess-business-loss':
          Component = ExcessBusinessLossDetail;
          break;
      case 'net-operating-loss':
          Component = NetOperatingLossDetail;
          break;
      default:
          console.error('Unknown loss limitation type:', type);
  }

  if (Component) {
      try {
        const root = createRoot(mount);
        root.render(
          <ErrorBoundary>
            <Component interestId={interestId} year={year} />
          </ErrorBoundary>
        );
      } catch (error) {
        console.error('[LossLimitationDetail] Render error:', error);
        mount.innerHTML = `<div class="p-8 text-red-600">Error loading page: ${error instanceof Error ? error.message : String(error)}</div>`;
      }
  }
}
