import type { ElementType } from 'react';

interface PageHeaderProps {
  category: string;
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
}

export default function PageHeader({ category, title, description, icon: Icon, accent }: PageHeaderProps) {
  return <header className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${accent} px-7 py-8 text-white shadow-lg`}>
    <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
    <div className="relative flex items-center gap-5">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20"><Icon className="h-6 w-6" /></span>
      <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/70">{category}</p><h1 className="text-3xl font-extrabold tracking-tight">{title}</h1><p className="mt-1 max-w-2xl text-sm text-white/75">{description}</p></div>
    </div>
  </header>;
}
