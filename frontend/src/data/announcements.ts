export type Announcement = { id: string; label: string; title: string; detail: string; time: string; urgent: boolean; dueDate?: string; deadlineVerified?: boolean; actionHref?: string };
export const announcements: Announcement[] = [
  { id: '1', label: 'Action required', title: 'Complete your annual FINTRAC acknowledgement', detail: 'Review brokerage FINTRAC guidance and confirm the acknowledgement deadline with your administrator. September 30 was included in the sample content without a year and has not been verified.', time: 'September 30 · year unconfirmed', urgent: true, deadlineVerified: false, actionHref: '/compliance/fintrac/' },
  { id: '2', label: 'Office update', title: 'Downtown office access this Saturday', detail: 'The east entrance will be closed for scheduled maintenance. Please use the main lobby entrance.', time: '2 days ago', urgent: false },
  { id: '3', label: 'Reminder', title: 'October content requests close Friday', detail: 'Send campaign and design requests to the marketing team before 4:00 PM on Friday.', time: '3 days ago', urgent: false },
];
export function announcementStatus(item: Announcement, now = new Date()) {
  const dueDate = item.dueDate;
  const validDate = dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate) && Number.isFinite(Date.parse(`${dueDate}T12:00:00Z`)) && new Date(`${dueDate}T12:00:00Z`).toISOString().slice(0, 10) === dueDate;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  if (item.deadlineVerified && validDate) return { overdue: dueDate < today, label: dueDate < today ? 'Overdue' : 'Action required', deadline: `Due ${dueDate}` };
  return { overdue: false, label: item.urgent ? 'Action required' : item.label, deadline: item.urgent ? 'Deadline unverified' : item.time };
}
