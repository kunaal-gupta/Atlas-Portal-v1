import { Lightbulb } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function TipsPage() {
  return <ResourcePage category="Resources" title="Tips" description="Field-tested advice, scripts, checklists, and productivity ideas." icon={Lightbulb} accent="from-indigo-600 to-indigo-500" />;
}
