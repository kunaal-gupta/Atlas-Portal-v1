import { BriefcaseBusiness, Building2, Mail, MapPin, Phone } from 'lucide-react';
import type { Agent } from '../../types';

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const role = (agent: Agent) => agent.job_title || 'Agent';

export default function AgentCard({ agent, view = 'grid' }: { agent: Agent; view?: 'grid' | 'list' }) {
  const active = agent.status.toLowerCase() === 'active';
  const photo = agent.profile_photo;
  const banner = agent.agency?.company_banner;
  const avatar = <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-gradient-to-br from-indigo-600 to-slate-900 text-xs font-extrabold tracking-wide text-white shadow-md dark:border-slate-900">{photo ? <img src={photo} alt={`${agent.full_name} profile`} className="h-full w-full object-cover" /> : initials(agent.full_name)}</div>;
  const details = <>
    <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-[15px] font-bold tracking-tight text-slate-950 dark:text-white">{agent.full_name}</h3><p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] font-medium text-slate-500"><BriefcaseBusiness className="h-3 w-3" />{role(agent)}</p></div><span className={`h-fit shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{agent.status}</span></div>
      <p className="mt-2 flex items-center gap-1.5 truncate text-[11px] font-semibold text-slate-600 dark:text-slate-300"><Building2 className="h-3 w-3 text-indigo-500" />{agent.agency?.company_name || 'Independent'}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-500"><a href={`mailto:${agent.email}`} className="flex items-center gap-1.5 hover:text-indigo-600"><Mail className="h-3 w-3" />{agent.email}</a>{agent.phone_number && <a href={`tel:${agent.phone_number}`} className="flex items-center gap-1.5 hover:text-indigo-600"><Phone className="h-3 w-3" />{agent.phone_number}</a>}{agent.location && <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{agent.location}</span>}</div>
    </div>
  </>;

  return <article className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
    <div className="flex h-20 items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-2 dark:from-slate-800 dark:via-slate-900 dark:to-indigo-950">{banner ? <img src={banner} alt={`${agent.agency?.company_name || 'Agency'} banner`} className="h-full w-full object-contain" /> : agent.agency?.company_logo ? <img src={agent.agency.company_logo} alt={`${agent.agency.company_name} logo`} className="h-full w-full object-contain" /> : <Building2 className="h-7 w-7 text-indigo-300" />}</div>
    <div className="border-t border-slate-100 px-4 pb-4 dark:border-slate-800"><div className="-mt-7 mb-2">{avatar}</div>{details}</div>
  </article>;
}
