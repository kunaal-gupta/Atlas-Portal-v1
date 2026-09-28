import { Inbox } from 'lucide-react';

export default function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700"><Inbox className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{message}</p></div>;
}
