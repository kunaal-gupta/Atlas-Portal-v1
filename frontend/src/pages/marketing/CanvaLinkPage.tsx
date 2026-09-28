import { ExternalLink } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function CanvaLinkPage() {
  return <ResourcePage category="Marketing" title="Canva Link" description="Open the company’s shared, editable Canva template library." icon={ExternalLink} accent="from-orange-500 to-rose-500" />;
}
