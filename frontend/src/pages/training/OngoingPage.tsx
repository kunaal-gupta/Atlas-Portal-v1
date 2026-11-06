import { BookOpenCheck } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function OngoingPage() {
  return <ResourcePage category="Training" title="On-Going" description="Workshops, recorded sessions, and continuing education." icon={BookOpenCheck} accent="from-indigo-600 to-indigo-500" />;
}
