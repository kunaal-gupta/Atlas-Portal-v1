import { BarChart3 } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function MarketPage() {
  return <ResourcePage category="The Numbers" title="Market" description="Market snapshots, trends, statistics, and monthly reports." icon={BarChart3} accent="from-indigo-600 to-indigo-500" intro={<a href="/the-numbers/market/city-intelligence/" className="mt-4 inline-flex rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">Edmonton City Intelligence</a>} />;
}
