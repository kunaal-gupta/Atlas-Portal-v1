import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { parseNumbersPayload, type NumbersPayload, type NumbersStatus } from '../lib/reporting';
const initialNumbers: NumbersPayload = { activeListings: 86, pendingTransactions: 31, closedThisMonth: 47, salesVolume: 28400000 };
const ReportingContext = createContext<{ numbers: NumbersPayload; status: NumbersStatus }>({ numbers: initialNumbers, status: { mode: 'loading' } });

export function CompanyReportingProvider({ children }: { children: ReactNode }) {
  const [numbers, setNumbers] = useState(initialNumbers);
  const [status, setStatus] = useState<NumbersStatus>({ mode: 'loading' });
  useEffect(() => {
    let cancelled = false;
    fetch('/api/skyslope/numbers/').then(response => response.ok ? response.json() : Promise.reject()).then(raw => {
      const value = parseNumbersPayload(raw);
      if (!cancelled) { setNumbers(value); setStatus({ mode: value.dataMode || 'snapshot', updatedAt: value.updatedAt, fetchedAt: new Date().toISOString() }); }
    }).catch(() => { if (!cancelled) setStatus({ mode: 'demo' }); });
    return () => { cancelled = true; };
  }, []);
  return <ReportingContext.Provider value={{ numbers, status }}>{children}</ReportingContext.Provider>;
}
export const useCompanyReporting = () => useContext(ReportingContext);
