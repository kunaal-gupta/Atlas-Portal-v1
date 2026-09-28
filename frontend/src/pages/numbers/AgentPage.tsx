import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List, Search, Users } from 'lucide-react';
import { getAgents } from '../../api/agents';
import AgentCard from '../../components/agents/AgentCard';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';
import type { Agent } from '../../types';

const MOZAIC = 'mozaic realty group';

export default function AgentPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => { getAgents().then(setAgents).catch(() => setFailed(true)).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => agents.filter((agent) => !query || [agent.full_name, agent.email, agent.job_title, agent.location, agent.agency?.company_name].some((value) => value?.toLowerCase().includes(query.toLowerCase()))), [agents, query]);
  const groups = [
    { title: 'Mozaic Realty Group', agents: visible.filter((agent) => agent.agency?.company_name.toLowerCase() === MOZAIC) },
    { title: 'Other agencies', agents: visible.filter((agent) => agent.agency?.company_name.toLowerCase() !== MOZAIC) },
  ].filter((group) => group.agents.length);

  return <div className="mx-auto max-w-[1400px] px-5 py-7 lg:px-10"><PageHeader category="The Numbers" title="Agent" description="Your company directory, production contacts, and agent information." icon={Users} accent="from-blue-600 to-cyan-500" />
    <section className="mt-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-extrabold">Agent directory</h2><p className="text-xs text-slate-500">{loading ? 'Loading directory…' : `${visible.length} agents`}</p></div><div className="flex items-center gap-2"><label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search agents or agencies" className="w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label><div className="flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900" aria-label="Directory view"><button onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'} className={`rounded-md p-1.5 ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}><LayoutGrid className="h-4 w-4" /></button><button onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'} className={`rounded-md p-1.5 ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}><List className="h-4 w-4" /></button></div></div></div>
    {failed ? <div className="mt-6"><EmptyState title="Directory unavailable" message="Please try again shortly." /></div> : !loading && !visible.length ? <div className="mt-6"><EmptyState title="No agents found" message="Try another search term." /></div> : <div className="mt-6 space-y-8">{groups.map((group) => <section key={group.title} aria-labelledby={`group-${group.title.replace(/\s/g, '-')}`}><div className="mb-3 flex items-center gap-3"><h3 id={`group-${group.title.replace(/\s/g, '-')}`} className="text-xs font-black uppercase tracking-[.16em] text-slate-500">{group.title}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800">{group.agents.length}</span><span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" /></div><div className={view === 'grid' ? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4' : 'grid gap-2 lg:grid-cols-2'}>{group.agents.map((agent) => <AgentCard key={agent.userid} agent={agent} view={view} />)}</div></section>)}</div>}</section>
  </div>;
}
