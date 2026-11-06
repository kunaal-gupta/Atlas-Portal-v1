import { useEffect } from 'react';
import { recordVisit } from '../api/workspace';
export default function WorkspaceTracker() {
  useEffect(() => {
    const title = document.querySelector('main h1')?.textContent?.trim();
    if (title && !['/', '/my-atlas/', '/support/'].includes(window.location.pathname)) void recordVisit(title, window.location.pathname + window.location.search, 'page');
    const captureFile = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-resource-title]') : null;
      if (link) void recordVisit(link.dataset.resourceTitle || 'Resource', link.getAttribute('href') || '', 'file');
    };
    document.addEventListener('click', captureFile);
    return () => document.removeEventListener('click', captureFile);
  }, []);
  return null;
}
