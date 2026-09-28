import { Lightbulb } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function TipsPage() {
  return <ResourcePage category="Resources" title="Tips" description="Field-tested advice, scripts, checklists, and productivity ideas." icon={Lightbulb} accent="from-emerald-600 to-teal-500" />;
}
