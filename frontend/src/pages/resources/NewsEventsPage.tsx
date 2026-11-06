import { Newspaper } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function NewsEventsPage() {
  return <ResourcePage category="Resources" title="News & Events" description="Company announcements, upcoming sessions, and event updates." icon={Newspaper} accent="from-indigo-600 to-indigo-500" />;
}
