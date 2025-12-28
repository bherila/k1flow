import './bootstrap';
import { createRoot } from 'react-dom/client';
import K1OutsideBasisDetail from '@/components/k1/K1OutsideBasisDetail';

const mount = document.getElementById('k1-outside-basis');
if (mount) {
  const companyId = parseInt(mount.dataset.companyId || '0', 10);
  const formId = parseInt(mount.dataset.formId || '0', 10);
  if (companyId > 0 && formId > 0) {
    createRoot(mount).render(<K1OutsideBasisDetail companyId={companyId} formId={formId} />);
  }
}
