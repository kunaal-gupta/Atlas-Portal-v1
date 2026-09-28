import { BookMarked } from 'lucide-react';
import ResourcePage from '../../components/shared/ResourcePage';

export default function BrandBookSummaryPage() {
  return <ResourcePage category="Marketing" title="Brand Book Summary" description="A practical guide to colours, typography, voice, and usage." icon={BookMarked} accent="from-orange-500 to-rose-500" />;
}
