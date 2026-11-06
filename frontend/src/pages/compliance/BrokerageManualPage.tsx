import { BookLock } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function BrokerageManualPage() {
  return <ResourcePage category="Compliance" title="Brokerage Manual" description="Company policies, procedures, standards, and responsibilities." icon={BookLock} accent="from-indigo-600 to-indigo-500" />;
}
