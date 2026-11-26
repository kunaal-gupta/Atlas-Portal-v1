"""Django email delivery through Microsoft Graph application credentials."""

from urllib.parse import quote

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.mail.backends.base import BaseEmailBackend

from .outlook import MicrosoftGraphClient, OutlookApiError


class GraphEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        if not email_messages:
            return 0

        sender = settings.EMAIL_FROM
        credentials = (
            settings.AZURE_TENANT_ID,
            settings.AZURE_CLIENT_ID,
            settings.AZURE_CLIENT_SECRET,
        )
        if not sender or not all(credentials):
            raise ImproperlyConfigured(
                "Graph email requires AZURE_TENANT_ID, AZURE_CLIENT_ID, "
                "AZURE_CLIENT_SECRET, and EMAIL_FROM."
            )

        client = MicrosoftGraphClient(*credentials)
        url = f"{client.graph_url}/users/{quote(sender, safe='')}/sendMail"
        sent = 0
        for email in email_messages:
            if not email.recipients():
                continue

            html = next(
                (part.content for part in getattr(email, "alternatives", ()) if part.mimetype == "text/html"),
                None,
            )
            message = {
                "subject": email.subject,
                "body": {
                    "contentType": "HTML" if html is not None else "Text",
                    "content": html if html is not None else email.body,
                },
            }
            for key, addresses in (
                ("toRecipients", email.to),
                ("ccRecipients", email.cc),
                ("bccRecipients", email.bcc),
            ):
                if addresses:
                    message[key] = [{"emailAddress": {"address": address}} for address in addresses]

            try:
                client.request(url, method="POST", data={"message": message, "saveToSentItems": False})
            except OutlookApiError:
                if not self.fail_silently:
                    raise
            else:
                sent += 1

        return sent
