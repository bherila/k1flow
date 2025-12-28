import './bootstrap';
import { createRoot } from 'react-dom/client';
import K1LossLimitationsDetail from '@/components/k1/K1LossLimitationsDetail';

const mount = document.getElementById('k1-loss-limitations');
if (mount) {
  const companyId = parseInt(mount.dataset.companyId || '0', 10);
  const formId = parseInt(mount.dataset.formId || '0', 10);
  if (companyId > 0 && formId > 0) {
    createRoot(mount).render(<K1LossLimitationsDetail companyId={companyId} formId={formId} />);
  }
}
