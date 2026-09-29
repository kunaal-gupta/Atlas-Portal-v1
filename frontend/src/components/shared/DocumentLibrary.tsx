import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Folder, LayoutGrid, List, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { DocumentItem } from '../../types';
import EmptyState from './EmptyState';
import ResourceCard from './ResourceCard';

interface FolderNode { files: DocumentItem[]; folders: Map<string, FolderNode> }
type SortOption = 'title-asc' | 'title-desc' | 'newest' | 'oldest';

function buildTree(documents: DocumentItem[]): FolderNode {
  const root: FolderNode = { files: [], folders: new Map() };
  documents.forEach((document) => {
    let node = root;
    document.folder_path.forEach((folderName) => {
      if (!node.folders.has(folderName)) node.folders.set(folderName, { files: [], folders: new Map() });
      node = node.folders.get(folderName)!;
    });
    node.files.push(document);
  });
  return root;
}

function totalFiles(node: FolderNode): number {
  return node.files.length + [...node.folders.values()].reduce((total, child) => total + totalFiles(child), 0);
}

function FileGrid({ files, view }: { files: DocumentItem[]; view: 'grid' | 'list' }) {
  if (!files.length) return null;
  return <div className={`mt-3 grid gap-3 ${view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
    {files.map((document) => <ResourceCard key={document.id} title={document.title} href={document.url} updatedDate={document.updated_date} />)}
  </div>;
}

function FolderSection({ name, node, path, collapsed, toggle, view, filtering }: { name: string; node: FolderNode; path: string; collapsed: Set<string>; toggle: (path: string) => void; view: 'grid' | 'list'; filtering: boolean }) {
  const isCollapsed = !filtering && collapsed.has(path);
  return <section className="mt-4 border-l border-slate-200 pl-4 dark:border-slate-700">
    <button type="button" onClick={() => toggle(path)} aria-expanded={!isCollapsed} className="flex w-full items-center gap-2 rounded-lg py-1 text-left text-slate-700 hover:text-indigo-600 dark:text-slate-200">
      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"><Folder className="h-4 w-4" /></span>
      <h3 className="text-sm font-bold">{name}</h3><span className="text-xs text-slate-400">{totalFiles(node)} files</span>
    </button>
    {!isCollapsed && <div className="pl-6"><FileGrid files={node.files} view={view} />{[...node.folders.entries()].map(([folderName, child]) => <FolderSection key={folderName} name={folderName} node={child} path={`${path}/${folderName}`} collapsed={collapsed} toggle={toggle} view={view} filtering={filtering} />)}</div>}
  </section>;
}

export default function DocumentLibrary({ documents }: { documents: DocumentItem[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('title-asc');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = term ? documents.filter((document) => `${document.title} ${document.folder_path.join(' ')} ${document.url}`.toLowerCase().includes(term)) : documents;
    return [...filtered].sort((left, right) => {
      if (sort === 'title-asc') return left.title.localeCompare(right.title);
      if (sort === 'title-desc') return right.title.localeCompare(left.title);
      const difference = new Date(left.updated_date).getTime() - new Date(right.updated_date).getTime();
      return sort === 'oldest' ? difference : -difference;
    });
  }, [documents, query, sort]);
  const tree = useMemo(() => buildTree(visible), [visible]);
  const folderPaths = useMemo(() => documents.flatMap((document) => document.folder_path.map((_, index) => document.folder_path.slice(0, index + 1).join('/'))), [documents]);
  const toggle = (path: string) => setCollapsed((current) => { const next = new Set(current); next.has(path) ? next.delete(path) : next.add(path); return next; });

  return <div className="mt-5">
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <label className="relative min-w-56 flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter files and folders" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label>
      <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} aria-label="Sort documents" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="title-asc">Name A–Z</option><option value="title-desc">Name Z–A</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
      <button type="button" onClick={() => setCollapsed(new Set())} title="Expand all folders" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-indigo-600 dark:border-slate-700"><ChevronsUpDown className="h-4 w-4" /></button>
      <button type="button" onClick={() => setCollapsed(new Set(folderPaths))} title="Collapse all folders" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-indigo-600 dark:border-slate-700"><ChevronsDownUp className="h-4 w-4" /></button>
      <div className="flex rounded-lg border border-slate-200 p-1 dark:border-slate-700"><button type="button" onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'} className={`rounded-md p-1.5 ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><LayoutGrid className="h-4 w-4" /></button><button type="button" onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'} className={`rounded-md p-1.5 ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><List className="h-4 w-4" /></button></div>
      <span className="w-full text-xs text-slate-500 sm:w-auto">{visible.length} of {documents.length} files</span>
    </div>
    {!visible.length ? <div className="mt-5"><EmptyState title="No matching files" message="Try a different filter." /></div> : <><FileGrid files={tree.files} view={view} />{[...tree.folders.entries()].map(([folderName, node]) => <FolderSection key={folderName} name={folderName} node={node} path={folderName} collapsed={collapsed} toggle={toggle} view={view} filtering={Boolean(query.trim())} />)}</>}
  </div>;
}
