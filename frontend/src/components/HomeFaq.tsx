import { ChevronDown, CircleHelp } from 'lucide-react';

const linkStyle = 'font-medium text-indigo-700 underline decoration-indigo-200 underline-offset-2 hover:decoration-indigo-700 dark:text-indigo-300';
const questions = [
  { id: 'access', question: 'How do I sign in or get access to Atlas?', answer: <>Use your approved work email to request a one-time login code. Codes expire after 10 minutes. If your email is not approved or you need a different access level, contact your brokerage administrator.</> },
  { id: 'documents', question: 'Where can I find forms, checklists, and brokerage documents?', answer: <>Use the search bar or open a navigation category to browse its topics. The <a href="/resources/general/" className={linkStyle}>resource library</a> lets you filter files and folders, sort by name or updated date, and preview or download documents.</> },
  { id: 'favorites', question: 'Can I customize my toolkit?', answer: <>Select Customize in Agent Toolkit to choose favorites and edit tool links. These preferences are saved for your account on this browser and do not sync across devices.</> },
  { id: 'my-atlas', question: 'Where are my saved files and training progress?', answer: <>Open <a href="/my-atlas/" className={linkStyle}>My Atlas</a> for saved files, bookmarks, recent pages, and a personal training checklist. Use the bookmark icon beside a file to save it. Training checkmarks are self-tracked learning notes, not verified certifications.</> },
  { id: 'support', question: 'How can I request help from the brokerage?', answer: <>Open the <a href="/support/" className={linkStyle}>Agent Support Desk</a>, select Marketing, Accounting, Conveyancing, or IT, and describe your request. Return to see its status and add follow-up messages. Your requests are visible only to you and support administrators.</> },
  { id: 'calendar', question: 'Where do upcoming events and training sessions come from?', answer: <>Upcoming events come from the connected brokerage Outlook calendar. Open the <a href="/resources/calendar/" className={linkStyle}>full calendar</a> for dates, times, and locations. Creating or editing events requires write access. If events are unavailable, retry or ask your administrator to check the calendar connection.</> },
  { id: 'calculators', question: 'How should I use the mortgage and commission calculators?', answer: <>Open <a href="/the-numbers/calculators/" className={linkStyle}>Calculators</a> to model mortgage payments, ownership costs, commissions, and seller proceeds in Canadian dollars. Rates and costs are editable examples. Results are planning estimates, not lender approval or a required commission rate; confirm the applicable lender terms, fee agreement, and taxes.</> },
  { id: 'reporting', question: 'Are the company performance figures live?', answer: <>Check the data-source label beside Company metrics. Open it for freshness details; a source update time is shown when supplied. Demonstration figures are illustrative and must not be used for brokerage reporting. A live-source or cached snapshot is identified only when the reporting service provides that information; a missing timestamp means freshness is not confirmed.</> },
  { id: 'announcements', question: 'What should I do with a required announcement?', answer: <>Use the required-action banner or open Announcements using the bell in the header, then select Review now to open the linked guidance. Dismissing the banner only hides the reminder for this session; it does not complete an acknowledgement. A deadline is marked overdue only when its date has been verified. If a deadline is unverified or you need to confirm how to submit an acknowledgement, contact your brokerage administrator.</> },
];

export default function HomeFaq() {
  return <section id="faq" aria-labelledby="faq-heading" className="home-panel min-w-0">
    <div className="mb-3 flex items-start gap-3"><CircleHelp aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-300" /><div><h2 id="faq-heading" className="home-section-title">Frequently asked questions</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Help with everyday portal tasks.</p></div></div>
    <div className="divide-y divide-slate-100 dark:divide-slate-700">{questions.map(item => <details key={item.id} id={`faq-${item.id}`} name="homepage-faq" className="group">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-2.5 text-sm font-semibold text-slate-800 hover:text-indigo-700 dark:text-slate-100 dark:hover:text-indigo-300"><span>{item.question}</span><ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 motion-safe:transition-transform group-open:rotate-180" /></summary>
      <div className="max-w-4xl pb-4 pr-5 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.answer}</div>
    </details>)}</div>

  </section>;
}
