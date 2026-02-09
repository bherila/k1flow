import React from 'react';
import { createRoot } from 'react-dom/client';

import OwnershipInterestDetail from './components/k1/OwnershipInterestDetail';

console.log('[OwnershipInterest] Script loaded');

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[OwnershipInterest] Error caught by boundary:', error, errorInfo);
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

const mount = document.getElementById('ownership-interest-detail');
console.log('[OwnershipInterest] Mount element:', mount);

if (mount) {
  const interestId = parseInt(mount.dataset.interestId || '0', 10);
  console.log('[OwnershipInterest] Interest ID:', interestId);
  
  try {
    const root = createRoot(mount);
    root.render(
      <ErrorBoundary>
        <OwnershipInterestDetail interestId={interestId} />
      </ErrorBoundary>
    );
    console.log('[OwnershipInterest] Component rendered');
  } catch (error) {
    console.error('[OwnershipInterest] Render error:', error);
    mount.innerHTML = `<div class="p-8 text-red-600">Error loading page: ${error instanceof Error ? error.message : String(error)}</div>`;
  }
} else {
  console.error('[OwnershipInterest] Mount element not found');
}
