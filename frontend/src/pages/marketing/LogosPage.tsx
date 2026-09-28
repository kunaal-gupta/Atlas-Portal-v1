import { Shapes } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function LogosPage() {
  return <ResourcePage category="Marketing" title="Logos" description="Current company and team logos in print and digital formats." icon={Shapes} accent="from-orange-500 to-rose-500" />;
}
