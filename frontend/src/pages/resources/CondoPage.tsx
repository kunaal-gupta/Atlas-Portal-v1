import { Building } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function CondoPage() {
  return <ResourcePage category="Resources" title="Condo" description="Condominium forms, guides, clauses, and reference documents." icon={Building} accent="from-emerald-600 to-teal-500" />;
}
