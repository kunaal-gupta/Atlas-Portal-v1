import { useEffect, useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { getAgents } from '../../api/agents';
import AgentCard from '../../components/agents/AgentCard';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';
import type { Agent } from '../../types';

export default function AgentPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => { getAgents().then(setAgents).catch(() => setFailed(true)).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => agents.filter((agent) => !query || [agent.full_name, agent.email, agent.job_title, agent.location].some((value) => value?.toLowerCase().includes(query.toLowerCase()))), [agents, query]);
  return <div className="mx-auto max-w-[1400px] px-5 py-7 lg:px-10"><PageHeader category="The Numbers" title="Agent" description="Your company directory, production contacts, and agent information." icon={Users} accent="from-blue-600 to-cyan-500" />
    <section className="mt-8"><div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-extrabold">All agents</h2><p className="text-sm text-slate-500">{loading ? 'Loading directory…' : `${visible.length} agents`}</p></div><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents" className="rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 dark:border-slate-700 dark:bg-slate-900" /></label></div>
    {failed ? <div className="mt-6"><EmptyState title="Directory unavailable" message="Please try again shortly." /></div> : !loading && !visible.length ? <div className="mt-6"><EmptyState title="No agents found" message="Try another search term." /></div> : <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visible.map((agent) => <AgentCard key={agent.userid} agent={agent} />)}</div>}</section>
  </div>;
}
