import './bootstrap';

import { createRoot } from 'react-dom/client';

import K1FormStreamlined from '@/components/k1/K1FormStreamlined';
import { Toaster } from '@/components/ui/sonner';

const mount = document.getElementById('k1-form-streamlined');
if (mount) {
  const interestId = parseInt(mount.dataset.interestId || '0', 10);
  if (interestId > 0) {
    createRoot(mount).render(
      <>
        <K1FormStreamlined interestId={interestId} />
        <Toaster />
      </>
    );
  }
}
