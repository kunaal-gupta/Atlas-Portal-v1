import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import type { Agent } from '../../types';

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const role = (agent: Agent) => agent.job_title || 'Agent';

export default function AgentCard({ agent, view = 'grid' }: { agent: Agent; view?: 'grid' | 'list' }) {
  const active = agent.status.toLowerCase() === 'active';
  const photo = agent.profile_photo;
  const banner = agent.agency?.company_banner;
  const avatar = <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-white bg-slate-950 text-xs font-extrabold text-white shadow-sm dark:border-slate-900">{photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials(agent.full_name)}</div>;
  const details = <>
    <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-sm font-extrabold">{agent.full_name}</h3><p className="truncate text-[11px] text-slate-500">{role(agent)}</p></div><span className={`h-fit shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{agent.status}</span></div>
      <p className="mt-2 flex items-center gap-1.5 truncate text-[11px] font-semibold text-slate-600 dark:text-slate-300"><Building2 className="h-3 w-3 text-indigo-500" />{agent.agency?.company_name || 'Independent'}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-500"><a href={`mailto:${agent.email}`} className="flex items-center gap-1.5 hover:text-indigo-600"><Mail className="h-3 w-3" />{agent.email}</a>{agent.phone_number && <a href={`tel:${agent.phone_number}`} className="flex items-center gap-1.5 hover:text-indigo-600"><Phone className="h-3 w-3" />{agent.phone_number}</a>}{agent.location && <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{agent.location}</span>}</div>
    </div>
  </>;

  if (view === 'list') return <article className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">{avatar}{details}</article>;

  return <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
    <div className="h-14 bg-gradient-to-r from-indigo-700 to-cyan-500">{banner && <img src={banner} alt="" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" />}</div>
    <div className="px-4 pb-4"><div className="-mt-7 mb-2">{avatar}</div>{details}</div>
  </article>;
}
