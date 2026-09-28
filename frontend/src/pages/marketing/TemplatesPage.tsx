import { LayoutTemplate } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function TemplatesPage() {
  return <ResourcePage category="Marketing" title="Templates" description="Ready-to-use social, print, presentation, and listing templates." icon={LayoutTemplate} accent="from-orange-500 to-rose-500" />;
}
