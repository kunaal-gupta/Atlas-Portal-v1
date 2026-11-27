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
    <section id="numbers" aria-labelledby="workspace-metrics-title">
      <h2 id="workspace-metrics-title" className="home-section-title mb-3">Your activity</h2>
      {error ? (
        <div className="home-panel flex flex-wrap items-center justify-between gap-2 text-sm">
          <p role="status">Your activity is currently unavailable.</p>
          <button type="button" className="font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
            onClick={() => { setError(false); setAttempt(value => value + 1); }}>
            Retry
          </button>
        </div>
      ) : data ? (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map(({ key, label }) => (
            <div key={key} className="home-panel min-w-0">
              <dt className="text-xs text-slate-600 dark:text-slate-300">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white sm:text-3xl">
                {data[key].toLocaleString()}
              </dd>
            </div>
          ))}
        </dl>
      ) : <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Loading your activity…</p>}
    </section>
  );
}
