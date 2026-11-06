import { CircleHelp } from 'lucide-react';
import HomeFaq from '../../components/HomeFaq';
import ResourcePage from '../../components/shared/ResourcePage';

export default function FaqPage() {
  return <ResourcePage category="Help" title="FAQ" description="Answers to common questions about your Atlas portal." icon={CircleHelp} accent=""><div className="mt-4"><HomeFaq /></div></ResourcePage>;
}
