import { Folder } from 'lucide-react';
import type { DocumentItem } from '../../types';
import ResourceCard from './ResourceCard';

interface FolderNode {
  files: DocumentItem[];
  folders: Map<string, FolderNode>;
}

function buildTree(documents: DocumentItem[]): FolderNode {
  const root: FolderNode = { files: [], folders: new Map() };
  documents.forEach((document) => {
    let node = root;
    document.folder_path.forEach((folderName) => {
      if (!node.folders.has(folderName)) {
        node.folders.set(folderName, { files: [], folders: new Map() });
      }
      node = node.folders.get(folderName)!;
    });
    node.files.push(document);
  });
  return root;
}

function FolderSection({ name, node, depth }: { name: string; node: FolderNode; depth: number }) {
  return <section className={depth ? 'mt-4 border-l border-slate-200 pl-4 dark:border-slate-700' : 'mt-5'}>
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"><Folder className="h-4 w-4" /></span>
      <h3 className="text-sm font-bold">{name}</h3>
      <span className="text-xs text-slate-400">{node.files.length + node.folders.size} items</span>
    </div>
    {node.files.length > 0 && <div className="mt-3 grid gap-3 lg:grid-cols-3">
      {node.files.map((document) => <ResourceCard key={document.id} title={document.title} href={document.url} updatedDate={document.updated_date} />)}
    </div>}
    {[...node.folders.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([folderName, child]) =>
      <FolderSection key={folderName} name={folderName} node={child} depth={depth + 1} />
    )}
  </section>;
}

export default function DocumentLibrary({ documents }: { documents: DocumentItem[] }) {
  const root = buildTree(documents);
  return <div>
    {root.files.length > 0 && <div className="mt-5 grid gap-3 lg:grid-cols-3">
      {root.files.map((document) => <ResourceCard key={document.id} title={document.title} href={document.url} updatedDate={document.updated_date} />)}
    </div>}
    {[...root.folders.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([folderName, node]) =>
      <FolderSection key={folderName} name={folderName} node={node} depth={0} />
    )}
  </div>;
}
