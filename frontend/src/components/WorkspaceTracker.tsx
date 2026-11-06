import { useEffect } from 'react';
import { usePortalUser } from './auth/AuthContext';
import { recordResource } from '../lib/workspace';

export default function WorkspaceTracker({ pages }: { pages: { name: string; path: string }[] }) {
  const user = usePortalUser();
  useEffect(() => {
    if (!user) return;
    const page = pages.find(item => item.path === window.location.pathname);
    if (page) recordResource(user.email, { href: page.path, title: page.name });
    const track = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[data-resource-title]');
      if (link && !link.pathname.startsWith('/admin/')) recordResource(user.email, { href: link.href, title: link.dataset.resourceTitle || '' });
    };
    document.addEventListener('click', track, true);
    document.addEventListener('auxclick', track, true);
    return () => { document.removeEventListener('click', track, true); document.removeEventListener('auxclick', track, true); };
  }, [user?.email, pages]);
  return null;
}
