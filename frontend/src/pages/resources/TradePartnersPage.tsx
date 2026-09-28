import { Handshake } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function TradePartnersPage() {
  return <ResourcePage category="Resources" title="Trade Partners" description="Trusted inspectors, lawyers, lenders, and service providers." icon={Handshake} accent="from-emerald-600 to-teal-500" />;
}
