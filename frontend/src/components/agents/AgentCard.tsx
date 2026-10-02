import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import type { Agent } from '../../types';

const initials = (name: string) => name
  .split(/\s+/)
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

const role = (agent: Agent) => agent.job_title || 'Agent';

const IconTile = ({ children, tone }: { children: React.ReactNode; tone: 'indigo' | 'blue' | 'emerald' | 'pink' }) => {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-300',
    pink: 'bg-pink-50 text-pink-600 dark:bg-pink-950/70 dark:text-pink-300',
  };

  return <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>{children}</span>;
};

export default function AgentCard({ agent }: { agent: Agent; view?: 'grid' | 'list' }) {
  const active = agent.status.toLowerCase() === 'active';
  const photo = agent.profile_photo;
  const banner = agent.agency?.company_banner;
  const logo = agent.agency?.company_logo;
  const agencyName = agent.agency?.company_name || 'Independent';

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_30px_-18px_rgba(30,64,175,0.3)] transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_38px_-20px_rgba(30,64,175,0.4)] dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-slate-100 via-white to-indigo-100 dark:from-slate-800 dark:via-slate-900 dark:to-indigo-950">
        {banner ? (
          <img src={banner} alt={`${agencyName} banner`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute -right-8 -top-14 h-36 w-36 rounded-full border-[26px] border-white/50 dark:border-white/5" />
            <div className="absolute -bottom-20 left-8 h-32 w-32 rotate-45 rounded-[2rem] bg-indigo-200/25 dark:bg-indigo-500/10" />
            {logo ? <img src={logo} alt={`${agencyName} logo`} className="relative max-h-14 max-w-[58%] object-contain" /> : <Building2 className="relative h-9 w-9 text-indigo-300 dark:text-indigo-600" />}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/10 to-transparent" />
      </div>

      <div className="relative px-4 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div className="-mt-8 h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-slate-900 shadow-lg dark:border-slate-900">
            {photo ? <img src={photo} alt={`${agent.full_name} profile`} className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center text-sm font-extrabold tracking-wide text-white">{initials(agent.full_name)}</span>}
          </div>
          <span className={`mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] ${active ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300' : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]' : 'bg-slate-400'}`} />
            {agent.status}
          </span>
        </div>

        <div className="mt-2.5">
          <h3 className="truncate text-base font-extrabold tracking-tight text-slate-950 dark:text-white">{agent.full_name}</h3>
          <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{role(agent)}</p>
        </div>

        <div className="my-3.5 h-px bg-slate-200/80 dark:bg-slate-800" />

        <div className="space-y-2.5 text-[11px] text-slate-700 dark:text-slate-300">
          <div className="flex min-w-0 items-center gap-2.5">
            <IconTile tone="indigo"><Building2 className="h-4 w-4" /></IconTile>
            <span className="truncate font-bold text-slate-900 dark:text-slate-100">{agencyName}</span>
          </div>
          <div className="space-y-2.5">
            <a href={`mailto:${agent.email}`} aria-label={`Email ${agent.full_name}`} className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none transition hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500">
              <IconTile tone="blue"><Mail className="h-4 w-4" /></IconTile>
              <span className="truncate">{agent.email}</span>
            </a>
            {agent.phone_number && (
              <a href={`tel:${agent.phone_number}`} aria-label={`Call ${agent.full_name}`} className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none transition hover:text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500">
                <IconTile tone="emerald"><Phone className="h-4 w-4" /></IconTile>
                <span className="truncate">{agent.phone_number}</span>
              </a>
            )}
          </div>
          {agent.location && (
            <div className="flex min-w-0 items-center gap-2.5">
              <IconTile tone="pink"><MapPin className="h-4 w-4" /></IconTile>
              <span className="truncate">{agent.location}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
