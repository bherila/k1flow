import './bootstrap';
import { createRoot } from 'react-dom/client';
import K1FormDetail from '@/components/k1/K1FormDetail';

const mount = document.getElementById('k1-form-detail');
if (mount) {
  const interestId = parseInt(mount.dataset.interestId || '0', 10);
  const formId = parseInt(mount.dataset.formId || '0', 10);
  if (interestId > 0 && formId > 0) {
    createRoot(mount).render(<K1FormDetail interestId={interestId} formId={formId} />);
  }
}
