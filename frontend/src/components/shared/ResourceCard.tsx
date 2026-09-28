import { Download, FileText } from 'lucide-react';

export default function ResourceCard({ title, href }: { title: string; href: string }) {
  return <a href={href} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950"><FileText className="h-5 w-5" /></span>
    <span className="min-w-0 flex-1"><b className="block truncate text-sm">{title}</b><small className="text-slate-500">Company approved · PDF</small></span>
    <Download className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-600" />
  </a>;
}
