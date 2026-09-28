import { Mail, MapPin, Phone } from 'lucide-react';
import type { Agent } from '../../types';

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const role = (agent: Agent) => agent.job_title || agent.agency?.company_name || 'Agent';

export default function AgentCard({ agent }: { agent: Agent }) {
  const active = agent.status.toLowerCase() === 'active';
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="h-16 bg-gradient-to-r from-indigo-600 to-cyan-500" />
    <div className="px-5 pb-5"><span className="-mt-8 grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-slate-950 text-sm font-extrabold text-white dark:border-slate-900">{initials(agent.full_name)}</span>
      <div className="mt-3 flex justify-between gap-3"><div><h3 className="font-extrabold">{agent.full_name}</h3><p className="text-xs text-slate-500">{role(agent)}</p></div><span className={`h-fit rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{agent.status}</span></div>
      <div className="mt-5 space-y-2 text-xs text-slate-500"><a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-indigo-600"><Mail className="h-3.5 w-3.5" />{agent.email}</a>{agent.phone_number && <a href={`tel:${agent.phone_number}`} className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{agent.phone_number}</a>}{agent.location && <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{agent.location}</p>}</div>
    </div>
  </article>;
}
