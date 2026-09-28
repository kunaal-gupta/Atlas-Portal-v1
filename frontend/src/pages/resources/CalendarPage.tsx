import { CalendarDays } from 'lucide-react';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';

export default function CalendarPage() {
  return <div className="mx-auto max-w-[1400px] px-5 py-7 lg:px-10"><PageHeader category="Resources" title="Calendar" description="Training, company, compliance, and community events." icon={CalendarDays} accent="from-emerald-600 to-teal-500" />
    <section className="mt-8"><h2 className="text-2xl font-extrabold">Upcoming events</h2><div className="mt-5"><EmptyState title="No upcoming events" message="New company events will appear here." /></div></section>
  </div>;
}
