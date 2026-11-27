import { portalRequest } from './portal';

export type WorkspaceResource = {
  id: number;
  url: string;
  title: string;
  kind: 'page' | 'file';
  saved: boolean;
  accessed_at: string | null;
};

type ResourceLists = { saved: WorkspaceResource[]; recent: WorkspaceResource[] };
let pendingResources: Promise<ResourceLists> | undefined;

export function getWorkspaceResources() {
  pendingResources ??= portalRequest<ResourceLists>('/api/workspace/')
    .finally(() => { pendingResources = undefined; });
  return pendingResources;
}

export function saveResource(url: string, title: string, saved: boolean, kind: WorkspaceResource['kind'] = 'file') {
  return portalRequest<WorkspaceResource>('/api/workspace/', { url, title, kind, saved });
}

export function recordResourceVisit(url: string, title: string) {
  void portalRequest<WorkspaceResource>('/api/workspace/', { url, title, kind: 'file' }).catch(() => {});
}
