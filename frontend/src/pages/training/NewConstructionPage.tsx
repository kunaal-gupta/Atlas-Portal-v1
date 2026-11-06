import { HardHat } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function NewConstructionPage() {
  return <ResourcePage category="Training" title="New Construction" description="Builder relationships, contracts, and new-home sales training." icon={HardHat} accent="from-indigo-600 to-indigo-500" />;
}
