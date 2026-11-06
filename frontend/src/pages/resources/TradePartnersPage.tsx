import { Handshake } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function TradePartnersPage() {
  return <ResourcePage category="Resources" title="Trade Partners" description="Trusted inspectors, lawyers, lenders, and service providers." icon={Handshake} accent="from-indigo-600 to-indigo-500" />;
}
