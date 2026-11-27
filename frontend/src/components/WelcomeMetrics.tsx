import { useEffect, useState } from 'react';
import { portalRequest } from '../api/portal';

type WorkspaceMetrics = {
  saved_resources: number;
  viewed_resources: number;
  completed_courses: number;
  open_support_requests: number;
};

const metrics: { key: keyof WorkspaceMetrics; label: string }[] = [
  { key: 'saved_resources', label: 'Saved resources' },
  { key: 'viewed_resources', label: 'Resources viewed' },
  { key: 'completed_courses', label: 'Courses completed' },
  { key: 'open_support_requests', label: 'Open support requests' },
];

export default function WelcomeMetrics() {
  const [data, setData] = useState<WorkspaceMetrics | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    portalRequest<{ metrics?: WorkspaceMetrics }>('/api/workspace/')
      .then(response => {
        if (!active) return;
        if (response.metrics) setData(response.metrics);
        else setError(true);
      })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [attempt]);

  return (
    <section id="numbers" aria-labelledby="workspace-metrics-title" className="lg:flex lg:items-center lg:gap-3">
      <h2 id="workspace-metrics-title" className="home-section-title mb-1 shrink-0 lg:mb-0">Your activity</h2>
      {error ? (
        <div className="home-panel flex flex-wrap items-center justify-between gap-2 text-sm">
          <p role="status">Your activity is currently unavailable.</p>
          <button type="button" className="font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
            onClick={() => { setError(false); setAttempt(value => value + 1); }}>
            Retry
          </button>
        </div>
      ) : data ? (
        <dl className="home-panel grid flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {metrics.map(({ key, label }) => (
            <div key={key} className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-2">
              <dt className="text-xs text-slate-600 dark:text-slate-300">{label}</dt>
              <dd className="text-xl font-semibold leading-tight tabular-nums text-slate-950 dark:text-white">
                {data[key].toLocaleString()}
              </dd>
            </div>
          ))}
        </dl>
      ) : <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Loading your activity…</p>}
    </section>
  );
}
