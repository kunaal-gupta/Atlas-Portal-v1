import { ChevronDown, ChevronRight, FilePlus2, FileText, Folder, FolderPlus, LayoutGrid, List, Search } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { getWorkspaceResources, recordResourceVisit, saveResource } from '../../api/workspace';
import type { DocumentItem } from '../../types';
import { usePortalUser } from '../auth/AuthContext';
import EmptyState from './EmptyState';
import { CategorySectionContext } from './CategoryOverview';
import ResourceCard, { FileActions, FileBookmarksContext, formatModifiedDate, getFileType, isImageFile } from './ResourceCard';

interface FolderNode { id: number | null; files: DocumentItem[]; folders: Map<string, FolderNode> }
type View = 'grid' | 'list';
type SortOption = 'title-asc' | 'title-desc' | 'newest' | 'oldest';
function buildTree(documents: DocumentItem[]) {
  const root: FolderNode = { id: null, files: [], folders: new Map() };
  documents.forEach(document => {
    let node = root;
    document.folder_ancestors.forEach(folder => {
      if (!node.folders.has(folder.name)) node.folders.set(folder.name, { id: folder.id, files: [], folders: new Map() });
      node = node.folders.get(folder.name)!;
    });
    node.files.push(document);
  });
  return root;
}
function countFiles(node: FolderNode): number { return node.files.length + [...node.folders.values()].reduce((sum, child) => sum + countFiles(child), 0); }

function Files({ files, view }: { files: DocumentItem[]; view: View }) {
  if (!files.length) return null;
  if (view === 'grid') return <div className="grid min-w-0 grid-cols-1 gap-3 py-2 md:grid-cols-2 xl:grid-cols-3">{files.map(file => <ResourceCard key={file.id} id={file.id} title={file.title} href={file.url} updatedDate={file.updated_date} />)}</div>;
  return <div className="divide-y divide-slate-100 dark:divide-slate-800">{files.map(file => <div key={file.id} data-file-row className="flex min-w-0 items-center gap-3 py-3">
    <FileText className="h-5 w-5 shrink-0 text-indigo-600" />
    <a href={file.url} onClick={() => recordResourceVisit(file.url, file.title)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 hover:text-indigo-700"><span title={file.title} className="block truncate text-sm font-medium">{file.title}</span><span className="block text-xs text-slate-500">{getFileType(file.url)}<span className="sm:hidden"> · {formatModifiedDate(file.updated_date)}</span></span></a>
    <span className="hidden shrink-0 text-xs text-slate-500 sm:block">{formatModifiedDate(file.updated_date)}</span><FileActions id={file.id} title={file.title} href={file.url} />
  </div>)}</div>;
}
function FolderSection({ name, node, view, filtering }: { name: string; node: FolderNode; view: View; filtering: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const user = usePortalUser();
  const open = filtering || expanded;
  return <section className="border-b border-slate-100 py-1 last:border-b-0 dark:border-slate-800">
    <div className="flex items-center gap-2"><button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={open} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg text-left text-sm font-semibold hover:text-indigo-700">{open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}<Folder className="h-5 w-5 shrink-0 text-indigo-600" /><span className="truncate">{name}</span><span className="shrink-0 text-xs font-normal text-slate-500">{countFiles(node)} files</span></button>
      {user?.is_superuser && node.id && <a href={`/admin/content/document/add/?folder=${node.id}`} aria-label={`Add file to ${name}`} className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50"><FilePlus2 className="h-4 w-4" /></a>}
    </div>
    {open && <div className="min-w-0 border-l border-slate-100 pl-3 dark:border-slate-800 sm:pl-5">{[...node.folders.entries()].map(([name, child]) => <FolderSection key={name} name={name} node={child} view={view} filtering={filtering} />)}<Files files={node.files} view={view} /></div>}
  </section>;
}
export default function DocumentLibrary({ documents }: { documents: DocumentItem[] }) {
  const user = usePortalUser();
  const Heading = useContext(CategorySectionContext) ? 'h3' : 'h2';
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('title-asc');
  const [view, setView] = useState<View>(() => documents.length > 0 && documents.every(file => isImageFile(file.url)) ? 'grid' : 'list');
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return documents.filter(file => `${file.title} ${file.folder_path.join(' ')}`.toLowerCase().includes(term)).sort((a, b) => {
      if (sort === 'title-asc') return a.title.localeCompare(b.title);
      if (sort === 'title-desc') return b.title.localeCompare(a.title);
      return (new Date(a.updated_date).getTime() - new Date(b.updated_date).getTime()) * (sort === 'oldest' ? 1 : -1);
    });
  }, [documents, query, sort]);
  const tree = useMemo(() => buildTree(visible), [visible]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    getWorkspaceResources().then(data => {
      if (active) setSaved(new Set(data.saved.map(item => item.url)));
    }).catch(() => { if (active) setNotice('Saved status could not be loaded.'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const toggle = async (url: string, title: string) => {
    const next = !saved.has(url);
    setNotice('');
    setPending(current => new Set(current).add(url));
    try {
      await saveResource(url, title, next);
      setSaved(current => {
        const updated = new Set(current);
        if (next) updated.add(url);
        else updated.delete(url);
        return updated;
      });
    } catch {
      setNotice('The bookmark could not be updated. Try again.');
    } finally {
      setPending(current => new Set([...current].filter(item => item !== url)));
    }
  };

  return <FileBookmarksContext.Provider value={{
    contains: url => saved.has(url),
    pending: url => !ready || pending.has(url),
    toggle: (url, title) => { void toggle(url, title); },
  }}><div className="min-w-0">
    {notice && <p role="status" className="mb-2 text-xs text-amber-800 dark:text-amber-300">{notice}</p>}
    <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
      <div>
        <Heading className="text-xl font-semibold">Resource library</Heading>
        <p className="mt-1 text-xs text-slate-500">{visible.length} of {documents.length} files</p>
      </div>
      <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto" role="group" aria-label="File controls">
        <label className="relative w-full min-w-0 sm:w-56 xl:w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input aria-label="Filter files and folders" value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter files and folders" className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
        <select aria-label="Sort documents" value={sort} onChange={event => setSort(event.target.value as SortOption)} className="h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900"><option value="title-asc">Name A–Z</option><option value="title-desc">Name Z–A</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
        <div className="flex gap-1">{(['list', 'grid'] as const).map(mode => <button key={mode} type="button" aria-label={`${mode === 'list' ? 'List' : 'Grid'} view`} aria-pressed={view === mode} onClick={() => setView(mode)} className={`grid h-8 w-8 place-items-center rounded-lg ${view === mode ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{mode === 'list' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}</button>)}</div>
        {user?.is_superuser && <><a href="/admin/content/document/add/" className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-700"><FilePlus2 className="h-4 w-4" />Add file</a><a href="/admin/content/documentfolder/add/" className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-700"><FolderPlus className="h-4 w-4" />Add folder</a></>}
      </div>
    </div>
    {!visible.length ? (documents.length > 0 ? <EmptyState title="No matching files" message="Try a different filter." /> : null) : <div className="min-w-0 border-t border-slate-200 dark:border-slate-700">{[...tree.folders.entries()].map(([name, node]) => <FolderSection key={name} name={name} node={node} view={view} filtering={Boolean(query.trim())} />)}<Files files={tree.files} view={view} /></div>}
  </div></FileBookmarksContext.Provider>;
}
