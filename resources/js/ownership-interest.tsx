import { createRoot } from 'react-dom/client';
import OwnershipInterestDetail from './components/k1/OwnershipInterestDetail';

const mount = document.getElementById('ownership-interest-detail');
if (mount) {
  const interestId = parseInt(mount.dataset.interestId || '0', 10);
  createRoot(mount).render(<OwnershipInterestDetail interestId={interestId} />);
}
