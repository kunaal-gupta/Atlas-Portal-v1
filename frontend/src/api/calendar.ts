export type OutlookEvent = {
  id: string;
  subject: string;
  bodyPreview?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName?: string };
  isAllDay: boolean;
  webLink?: string;
  organizer?: { emailAddress?: { name?: string; address?: string } };
};

export type EventInput = {
  subject: string;
  start: string;
  end: string;
  timeZone: string;
  isAllDay: boolean;
  location: string;
  description: string;
};

function csrfToken() {
  return document.cookie.split('; ').find(value => value.startsWith('csrftoken='))?.split('=')[1] || '';
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken(), ...options?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Calendar request failed (${response.status}).`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

export function getCalendarEvents(start: string, end: string) {
  const query = new URLSearchParams({ start, end });
  return request<{ events: OutlookEvent[]; mailbox: string }>(`/api/calendar/events/?${query}`);
}

export function createCalendarEvent(event: EventInput) {
  return request<OutlookEvent>('/api/calendar/events/', { method: 'POST', body: JSON.stringify(event) });
}

export function updateCalendarEvent(id: string, event: EventInput) {
  return request<OutlookEvent>(`/api/calendar/events/${encodeURIComponent(id)}/`, { method: 'PATCH', body: JSON.stringify(event) });
}

export function deleteCalendarEvent(id: string) {
  return request<void>(`/api/calendar/events/${encodeURIComponent(id)}/`, { method: 'DELETE' });
}
