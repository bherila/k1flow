import './bootstrap';

import { createRoot } from 'react-dom/client';

import K1FormDetail from '@/components/k1/K1FormDetail';
import { Toaster } from '@/components/ui/sonner';

const mount = document.getElementById('k1-form-detail');
if (mount) {
  const interestId = parseInt(mount.dataset.interestId || '0', 10);
  const taxYear = parseInt(mount.dataset.taxYear || '0', 10);
  if (interestId > 0 && taxYear > 0) {
    createRoot(mount).render(
      <>
        <K1FormDetail interestId={interestId} taxYear={taxYear} />
        <Toaster />
      </>
    );
  }
}
