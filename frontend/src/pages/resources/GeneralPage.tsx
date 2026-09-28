import { FolderOpen } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function GeneralPage() {
  return <ResourcePage category="Resources" title="General" description="Frequently used forms, office documents, and reference material." icon={FolderOpen} accent="from-emerald-600 to-teal-500" />;
}
