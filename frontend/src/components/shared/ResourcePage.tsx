import { useEffect, useState } from 'react';
import { getDocuments } from '../../api/documents';
import type { PageDefinition } from '../../types';
import type { DocumentItem } from '../../types';
import EmptyState from './EmptyState';
import PageHeader from './PageHeader';
import ResourceCard from './ResourceCard';

export default function ResourcePage({ category, title, description, icon, accent, children }: PageDefinition) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(children == null);

  useEffect(() => {
    if (children != null) return;
    setLoading(true);
    getDocuments(title).then(setDocuments).catch(() => setDocuments([])).finally(() => setLoading(false));
  }, [children, title]);

  return <div className="mx-auto max-w-[1400px] px-5 py-7 lg:px-10">
    <PageHeader category={category} title={title} description={description} icon={icon} accent={accent} />
    {children ?? <section className="mt-8"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-600">Curated for you</p><h2 className="mt-1 text-2xl font-extrabold">Resource library</h2>{loading ? <p className="mt-5 text-sm text-slate-500">Loading files…</p> : documents.length ? <div className="mt-5 grid gap-3 lg:grid-cols-3">{documents.map((document) => <ResourceCard key={document.id} title={document.title} href={document.url} />)}</div> : <div className="mt-5"><EmptyState title="No available files" message="Uploaded files will appear here when available." /></div>}</section>}
  </div>;
}
