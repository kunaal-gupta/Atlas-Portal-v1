import AgentWorkspace from './AgentWorkspace';
import NewsUpdates from './news/NewsUpdates';

export default function HomeDashboard() {
  return (
    <div className="mt-3 grid items-start gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
      <AgentWorkspace />
      <NewsUpdates />
    </div>
  );
}
