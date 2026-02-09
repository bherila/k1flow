import './bootstrap';

import { createRoot } from 'react-dom/client';

import CompanyDetail from '@/components/k1/CompanyDetail';

const mount = document.getElementById('company-detail');
if (mount) {
  const companyId = parseInt(mount.dataset.companyId || '0', 10);
  if (companyId > 0) {
    createRoot(mount).render(<CompanyDetail companyId={companyId} />);
  }
}
