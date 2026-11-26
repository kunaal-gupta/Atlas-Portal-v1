import json
from urllib.error import URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone


class LoginEmailError(Exception):
    pass


def send_graph_login_email(recipient, subject, html):
    tenant = settings.ATLAS_OTP_GRAPH_TENANT_ID
    client_id = settings.ATLAS_OTP_GRAPH_CLIENT_ID
    secret = settings.ATLAS_OTP_GRAPH_CLIENT_SECRET
    mailbox = settings.ATLAS_OTP_GRAPH_MAILBOX
    if not all((tenant, client_id, secret, mailbox)):
        raise LoginEmailError("Missing Atlas OTP Graph settings")

    token_request = Request(
        f"https://login.microsoftonline.com/{quote(tenant, safe='')}/oauth2/v2.0/token",
        data=urlencode({
            "client_id": client_id,
            "client_secret": secret,
            "scope": "https://graph.microsoft.com/.default",
            "grant_type": "client_credentials",
        }).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urlopen(token_request, timeout=10) as response:
            token = json.load(response)["access_token"]
        mail_request = Request(
            f"https://graph.microsoft.com/v1.0/users/{quote(mailbox, safe='')}/sendMail",
            data=json.dumps({
                "message": {
                    "subject": subject,
                    "importance": "high",
                    "body": {"contentType": "HTML", "content": html},
                    "toRecipients": [{"emailAddress": {"address": recipient}}],
                },
                "saveToSentItems": False,
            }).encode(),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
            method="POST",
        )
        with urlopen(mail_request, timeout=10):
            pass
    except (URLError, TimeoutError, ValueError, KeyError, TypeError) as error:
        status = getattr(error, "code", None)
        reason = f"HTTP {status}" if status else type(error).__name__
        raise LoginEmailError(f"Microsoft Graph OTP delivery failed ({reason})") from None


def send_login_code(recipient, code):
    subject = "Your Atlas Secure Login Code"
    html = render_to_string("content/otp_email.html", {"code": code, "year": timezone.now().year})
    provider = settings.ATLAS_OTP_EMAIL_PROVIDER
    if provider == "graph":
        send_graph_login_email(recipient, subject, html)
    elif provider == "django":
        send_mail(
            subject,
            f"Your one-time Atlas login code is {code}. It expires in 10 minutes.\n\n"
            "If you did not request this code, you can ignore this email.",
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            html_message=html,
        )
    else:
        raise LoginEmailError("Invalid Atlas OTP email provider")
