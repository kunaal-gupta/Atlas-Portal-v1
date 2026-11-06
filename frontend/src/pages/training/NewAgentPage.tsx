import { GraduationCap } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function NewAgentPage() {
  return <ResourcePage category="Training" title="New Agent" description="Onboarding, systems, fundamentals, and your first 90-day plan." icon={GraduationCap} accent="from-indigo-600 to-indigo-500" />;
}
