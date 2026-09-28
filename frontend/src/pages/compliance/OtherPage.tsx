import { Files } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function OtherPage() {
  return <ResourcePage category="Compliance" title="Other" description="Additional regulatory notices, forms, and reference documents." icon={Files} accent="from-cyan-600 to-blue-500" />;
}
