import { BarChart3 } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function MarketPage() {
  return <ResourcePage category="The Numbers" title="Market" description="Market snapshots, trends, statistics, and monthly reports." icon={BarChart3} accent="from-blue-600 to-cyan-500" />;
}
