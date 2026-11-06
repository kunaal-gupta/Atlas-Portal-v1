import { BadgeCheck } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function TipsPage() {
  return <ResourcePage category="Compliance" title="Tips" description="Plain-language reminders for complete and compliant files." icon={BadgeCheck} accent="from-indigo-600 to-indigo-500" />;
}
