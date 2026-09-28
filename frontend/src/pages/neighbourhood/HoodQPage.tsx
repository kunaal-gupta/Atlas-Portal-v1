import { MapPinned } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function HoodQPage() {
  return <ResourcePage category="Neighbourhoods" title="HoodQ" description="Create client-ready neighbourhood reports and local insights." icon={MapPinned} accent="from-rose-600 to-pink-500" />;
}
