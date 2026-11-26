"""Small Microsoft Graph client used by the portal calendar.

The client-credentials flow keeps the Microsoft application secret on the
server.  Calendar events are read from and written directly to Outlook, so
there is no second database that can drift out of sync.
"""

import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.cache import cache


class OutlookConfigurationError(Exception):
    pass


class OutlookApiError(Exception):
    def __init__(self, message, status=502):
        super().__init__(message)
        self.status = status


class MicrosoftGraphClient:
    graph_url = "https://graph.microsoft.com/v1.0"
    request_error = "Microsoft Graph rejected the request."

    def __init__(self, tenant_id, client_id, client_secret):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret

    def _token(self):
        cache_key = f"outlook-token:{self.tenant_id}:{self.client_id}"
        token = cache.get(cache_key)
        if token:
            return token
        payload = urlencode({
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": "https://graph.microsoft.com/.default",
            "grant_type": "client_credentials",
        }).encode()
        data = self.request(
            f"https://login.microsoftonline.com/{quote(self.tenant_id, safe='')}/oauth2/v2.0/token",
            method="POST",
            data=payload,
            authenticated=False,
            content_type="application/x-www-form-urlencoded",
        )
        token = data["access_token"]
        cache.set(cache_key, token, max(60, int(data.get("expires_in", 3600)) - 120))
        return token

    def request(self, url, method="GET", data=None, authenticated=True, content_type="application/json"):
        headers = {"Accept": "application/json"}
        if authenticated:
            headers["Authorization"] = f"Bearer {self._token()}"
        if data is not None:
            headers["Content-Type"] = content_type
            if content_type == "application/json":
                data = json.dumps(data).encode()
        request = Request(url, data=data, headers=headers, method=method)
        try:
            with urlopen(request, timeout=20) as response:
                body = response.read()
                return json.loads(body) if body else None
        except HTTPError as error:
            try:
                detail = json.loads(error.read()).get("error", {}).get("message")
            except (ValueError, AttributeError):
                detail = None
            status = error.code if error.code in (400, 404, 409) else 502
            raise OutlookApiError(detail or self.request_error, status) from error
        except URLError as error:
            raise OutlookApiError("Microsoft Outlook is temporarily unavailable.") from error

class OutlookCalendarClient(MicrosoftGraphClient):
    request_error = "Microsoft Outlook rejected the calendar request."

    def __init__(self):
        super().__init__(
            settings.MICROSOFT_TENANT_ID,
            settings.MICROSOFT_CLIENT_ID,
            settings.MICROSOFT_CLIENT_SECRET,
        )
        self.mailbox = settings.OUTLOOK_CALENDAR_MAILBOX
        if not all((self.tenant_id, self.client_id, self.client_secret, self.mailbox)):
            raise OutlookConfigurationError(
                "Outlook calendar is not configured. Add the Microsoft 365 credentials to the server environment."
            )

    @property
    def events_url(self):
        return f"{self.graph_url}/users/{quote(self.mailbox, safe='')}/events"

    def list_events(self, start, end):
        query = urlencode({
            "startDateTime": start,
            "endDateTime": end,
            "$select": "id,subject,bodyPreview,start,end,location,isAllDay,webLink,organizer,lastModifiedDateTime",
            "$orderby": "start/dateTime",
            "$top": "250",
        })
        url = f"{self.graph_url}/users/{quote(self.mailbox, safe='')}/calendarView?{query}"
        events = []
        while url:
            result = self.request(url)
            events.extend(result.get("value", []))
            url = result.get("@odata.nextLink")
        return events

    def create_event(self, event):
        return self.request(self.events_url, method="POST", data=event)

    def update_event(self, event_id, event):
        return self.request(f"{self.events_url}/{quote(event_id, safe='')}", method="PATCH", data=event)

    def delete_event(self, event_id):
        self.request(f"{self.events_url}/{quote(event_id, safe='')}", method="DELETE")
