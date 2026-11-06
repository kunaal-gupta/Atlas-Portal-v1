import { Building } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function CondoPage() {
  return <ResourcePage category="Resources" title="Condo" description="Condominium forms, guides, clauses, and reference documents." icon={Building} accent="from-indigo-600 to-indigo-500" />;
}
