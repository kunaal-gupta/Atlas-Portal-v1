import { useEffect, useState } from 'react';
import { getDocuments } from '../../api/documents';
import type { PageDefinition } from '../../types';
import type { DocumentItem } from '../../types';
import EmptyState from './EmptyState';
import DocumentLibrary from './DocumentLibrary';
import PageHeader from './PageHeader';

export default function ResourcePage({ category, title, description, icon, accent, children, intro }: PageDefinition) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(children == null);

  useEffect(() => {
    if (children != null) return;
    setLoading(true);
    getDocuments(title).then(setDocuments).catch(() => setDocuments([])).finally(() => setLoading(false));
  }, [children, title]);

  return <div className="mx-auto max-w-[1400px] px-5 py-3 lg:px-10">
    <PageHeader category={category} title={title} description={description} icon={icon} accent={accent} />
    {children ?? <section aria-label={`${title} resource library`} className="mt-3">{loading ? <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold">Resource library</h2><p role="status" className="text-sm text-slate-500">Loading files…</p></div> : <><DocumentLibrary documents={documents} />{!documents.length && <div className="mt-3"><EmptyState title="No available files" message="Uploaded files will appear here when available." /></div>}</>}</section>}
    {intro}
  </div>;
}
