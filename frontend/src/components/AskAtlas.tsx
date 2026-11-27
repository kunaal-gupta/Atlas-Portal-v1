import { ArrowUpRight, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { searchPortal, type SearchRecommendation } from '../api/search';
import { validWorkspaceUrl } from '../lib/workspace';
import type { NavigationGroup } from './layout/Sidebar';

const stopWords = new Set('about and are atlas can could does for from have help how the this use want was what when where which who why will with would you your find get show need download open'.split(' '));
const prompts = ['Find FINTRAC guidance', 'Find brokerage forms', 'Find training resources'];
const shortcuts: SearchRecommendation[] = [
  { type: 'Page', title: 'FAQ', subtitle: 'Portal help', url: '/faq/' },
  { type: 'Page', title: 'Agent Support Desk', subtitle: 'Get help from the brokerage', url: '/support/' },
  { type: 'Page', title: 'Brokerage forms', subtitle: 'General resources', url: '/resources/general/' },
  { type: 'Page', title: 'My resources', subtitle: 'Saved and recently opened resources', url: '/my-resources/' },
];

type Turn = { question: string; matches?: SearchRecommendation[]; failed?: boolean };

async function findResources(question: string, pages: SearchRecommendation[]) {
  const terms = [...new Set(question.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [])].filter(word => !stopWords.has(word));
  const keywords = terms.length ? terms : [question.toLowerCase()];
  const ranked = pages.map(page => ({
    page,
    score: keywords.reduce((total, term) => total + (page.title.toLowerCase().includes(term) ? 2 : page.subtitle.toLowerCase().includes(term) ? 1 : 0), 0),
  })).filter(item => item.score).sort((a, b) => b.score - a.score);
  const remote = await Promise.allSettled(keywords.slice(0, 3).map(searchPortal));
  const results = [...ranked.map(item => item.page), ...remote.flatMap(item => item.status === 'fulfilled' ? item.value : [])];
  const seen = new Set<string>();
  const matches = results.filter(item => {
    if (!item.url || !validWorkspaceUrl(item.url) || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }).slice(0, 5);
  return { matches, failed: remote.every(item => item.status === 'rejected') };
}

export default function AskAtlas({ open, onOpen, onClose, groups }: {
  open: boolean; onOpen: () => void; onClose: () => void; groups: NavigationGroup[];
}) {
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const pending = useRef(false);
  const searching = turns.length > 0 && turns[turns.length - 1].matches === undefined;

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    input.current?.focus();
    return () => {
      const previous = restoreFocus.current;
      if (previous && previous !== document.body && previous.isConnected) previous.focus();
      else launcher.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [turns, open]);

  const ask = async (value: string) => {
    const question = value.trim().slice(0, 240);
    if (!question || pending.current) return;
    pending.current = true;
    setDraft('');
    setTurns(current => [...current.slice(-11), { question }]);
    const pages = [...shortcuts, ...groups.flatMap(group => group.links.map(link => ({
      type: 'Page' as const, title: link.name, subtitle: group.name, url: link.path,
    })))];
    try {
      const reply = await findResources(question, pages);
      setTurns(current => [...current.slice(0, -1), { question, ...reply }]);
    } catch {
      setTurns(current => [...current.slice(0, -1), { question, matches: [], failed: true }]);
    } finally {
      pending.current = false;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[45] sm:bottom-6 sm:right-6">
      <button ref={launcher} type="button" hidden={open} onClick={onOpen}
        className={`${open ? 'hidden' : 'inline-flex'} min-h-12 items-center gap-2 rounded-full bg-[#274850] px-4 text-sm font-semibold text-white shadow-lg hover:bg-[#1f3c43]`}>
        <MessageCircle aria-hidden="true" className="h-5 w-5" />Ask Atlas
      </button>
      {open && (
        <section role="dialog" aria-labelledby="ask-atlas-title" aria-modal="false"
          onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); } }}
          className="flex h-[min(32rem,calc(100dvh-2rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <header className="flex items-center justify-between bg-[#274850] px-4 py-2 text-white">
            <div className="flex items-center gap-2"><MessageCircle aria-hidden="true" className="h-5 w-5" /><h2 id="ask-atlas-title" className="font-semibold !text-white">Ask Atlas</h2></div>
            <button type="button" aria-label="Close Ask Atlas" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/15"><X aria-hidden="true" className="h-5 w-5" /></button>
          </header>
          <div ref={log} role="log" aria-label="Ask Atlas conversation" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            <p className="text-slate-600 dark:text-slate-300">Ask for a form, policy, or training resource. Atlas will find links in the portal.</p>
            {!turns.length && <div className="flex flex-wrap gap-2">{prompts.map(prompt => (
              <button key={prompt} type="button" onClick={() => void ask(prompt)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-300">{prompt}</button>
            ))}</div>}
            {turns.map((turn, index) => (
              <div key={index} className="space-y-2">
                <p className="ml-auto w-fit max-w-[90%] break-words rounded-xl bg-indigo-50 px-3 py-2 dark:bg-indigo-950"><span className="sr-only">You: </span>{turn.question}</p>
                <div className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
                  <span className="sr-only">Atlas: </span>
                  {turn.matches === undefined ? <p className="px-1">Searching Atlas…</p>
                    : turn.matches.length ? <ul>{turn.matches.map(item => (
                      <li key={item.url}><a href={item.url} className="flex items-start justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="min-w-0"><strong className="block break-words">{item.title}</strong><span className="block text-xs text-slate-500 dark:text-slate-400">{item.type} · {item.subtitle}</span></span>
                        <ArrowUpRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700 dark:text-indigo-300" />
                      </a></li>
                    ))}</ul> : <p className="px-1">{turn.failed ? 'Portal search is unavailable. Try again shortly.' : 'No matching resources. Try a specific topic or document name.'}</p>}
                </div>
              </div>
            ))}
          </div>
          <form className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700" onSubmit={event => { event.preventDefault(); void ask(draft); }}>
            <input ref={input} aria-label="Ask Atlas message" placeholder="Ask about a portal resource" value={draft} onChange={event => setDraft(event.target.value)} maxLength={240}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-transparent px-2 text-sm dark:border-slate-700" />
            <button type="submit" disabled={searching || !draft.trim()} aria-label="Send message" className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-700 text-white disabled:opacity-50"><Send aria-hidden="true" className="h-4 w-4" /></button>
          </form>
        </section>
      )}
    </div>
  );
}
