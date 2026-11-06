import { ShieldCheck } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function FintracPage() {
  return <ResourcePage category="Compliance" title="FINTRAC" description="Identification, record keeping, reporting, and compliance resources." icon={ShieldCheck} accent="from-indigo-600 to-indigo-500" />;
}
