import { createRoot } from 'react-dom/client';
import OwnershipInterestDetail from './components/k1/OwnershipInterestDetail';
import React from 'react';

console.log('[OwnershipInterest] Script loaded');

const mount = document.getElementById('ownership-interest-detail');
console.log('[OwnershipInterest] Mount element:', mount);

if (mount) {
  const interestId = parseInt(mount.dataset.interestId || '0', 10);
  console.log('[OwnershipInterest] Interest ID:', interestId);
  
  try {
    const root = createRoot(mount);
    root.render(<OwnershipInterestDetail interestId={interestId} />);
    console.log('[OwnershipInterest] Component rendered');
  } catch (error) {
    console.error('[OwnershipInterest] Render error:', error);
    mount.innerHTML = `<div class="p-8 text-red-600">Error loading page: ${error instanceof Error ? error.message : String(error)}</div>`;
  }
} else {
  console.error('[OwnershipInterest] Mount element not found');
}
