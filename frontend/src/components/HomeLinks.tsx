import { Bookmark, Sparkles, TrendingUp } from 'lucide-react';

const tile = 'home-panel block h-full text-left hover:border-indigo-300 dark:hover:border-indigo-500';

export default function HomeLinks({ onAsk }: { onAsk: () => void }) {
  return (
    <section aria-label="More agent tools" className="mt-3 grid gap-3 sm:grid-cols-3">
      <a href="/the-numbers/market/" className={tile}>
        <TrendingUp aria-hidden="true" className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
        <h2 className="mt-2 text-base font-semibold">Market snapshot</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Market reports, trends, and Edmonton City Intelligence.</p>
      </a>
      <a href="/my-resources/" className={tile}>
        <Bookmark aria-hidden="true" className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
        <h2 className="mt-2 text-base font-semibold">My resources</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Saved and recently opened documents and forms.</p>
      </a>
      <button type="button" onClick={onAsk} className={tile}>
        <Sparkles aria-hidden="true" className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
        <span className="mt-2 block text-base font-semibold">Ask Atlas</span>
        <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">Find brokerage guidance, forms, and training.</span>
      </button>
    </section>
  );
}
