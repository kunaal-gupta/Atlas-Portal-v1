import type { PageDefinition } from '../../types';
import PageHeader from './PageHeader';
import ResourceCard from './ResourceCard';

const slugify = (text: string) => text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function ResourcePage({ category, title, description, icon, accent, children }: PageDefinition) {
  const slug = slugify(title);
  return <div className="mx-auto max-w-[1400px] px-5 py-7 lg:px-10">
    <PageHeader category={category} title={title} description={description} icon={icon} accent={accent} />
    {children ?? <section className="mt-8"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600">Curated for you</p><h2 className="mt-1 text-2xl font-extrabold">Resource library</h2><div className="mt-5 grid gap-3 lg:grid-cols-3">{['Agent guide', 'Checklist & workflow', 'Reference library'].map((label, index) => <ResourceCard key={label} title={`${title} — ${label}`} href={`/media/resources/${slug}-${index + 1}.pdf`} />)}</div></section>}
  </div>;
}
