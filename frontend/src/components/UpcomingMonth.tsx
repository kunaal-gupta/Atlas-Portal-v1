import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthFormat = new Intl.DateTimeFormat('en-CA', { month: 'long', year: 'numeric' });
const dateFormat = new Intl.DateTimeFormat('en-CA', { dateStyle: 'full' });
const dayKey = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export default function UpcomingMonth({ eventDates }: { eventDates: Date[] }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthLabel = monthFormat.format(month);
  const offset = month.getDay();
  const length = new Date(year, monthIndex + 1, 0).getDate();
  const eventDays = new Set(eventDates.map(dayKey));
  const today = dayKey(new Date());
  const shift = (step: number) => setMonth(current => new Date(current.getFullYear(), current.getMonth() + step, 1));
  const control = 'grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800';

  return (
    <div className="mb-2 rounded-lg border border-slate-200 px-2 pb-1 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <button type="button" className={control} aria-label="Previous calendar month" onClick={() => shift(-1)}><ChevronLeft className="h-4 w-4" /></button>
        <p aria-live="polite" className="text-sm font-semibold">{monthLabel}</p>
        <button type="button" className={control} aria-label="Next calendar month" onClick={() => shift(1)}><ChevronRight className="h-4 w-4" /></button>
      </div>
      <table aria-label={monthLabel + ' calendar'} className="w-full table-fixed text-center text-xs">
        <thead className="text-slate-500 dark:text-slate-400">
          <tr>{weekdays.map(day => <th key={day} scope="col" className="font-medium">{day}</th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil((offset + length) / 7) }, (_, week) => (
            <tr key={week}>
              {weekdays.map((day, column) => {
                const number = week * 7 + column - offset + 1;
                if (number < 1 || number > length) return <td key={day} />;
                const date = new Date(year, monthIndex, number);
                const key = dayKey(date);
                const hasEvent = eventDays.has(key);
                return (
                  <td key={day} className="p-0" aria-current={key === today ? 'date' : undefined}
                    aria-label={dateFormat.format(date) + (hasEvent ? ', scheduled event' : '')}>
                    <span className={`relative inline-grid h-6 w-6 place-items-center rounded-md ${key === today ? 'bg-indigo-700 font-semibold text-white' : hasEvent ? 'bg-indigo-50 font-semibold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200' : ''}`}>
                      {number}{hasEvent && <span aria-hidden="true" className="absolute bottom-0.5 h-0.5 w-2 rounded-full bg-current" />}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
