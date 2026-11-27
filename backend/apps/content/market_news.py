"""Edmonton headlines from APITube, with a shared cache per Django worker."""

import json
import re
from http.client import HTTPException, HTTPSConnection
from urllib.parse import urlencode, urlsplit

from django.conf import settings
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import HasPortalAccess

MARKET_TERMS = re.compile(
    r"\b(real estate|housing|rentals?|condos?|condominiums?|mortgages?|"
    r"residential development|home (?:sales|prices|buyers|building)|"
    r"homes|realtors?|property (?:sales|prices|market))\b",
    re.IGNORECASE,
)
CACHE_KEY = "atlas:edmonton-market-news:v1"
MAX_RESPONSE_BYTES = 4 * 1024 * 1024


def fetch_headlines(api_key):
    query = urlencode({
        "title": "Edmonton",
        "language.code": "en",
        "source.country.code": "ca",
        "per_page": 50,
    })
    connection = HTTPSConnection("api.apitube.io", timeout=5)
    try:
        connection.request("GET", f"/v1/news/everything?{query}", headers={
            "Accept": "application/json",
            "X-API-Key": api_key,
        })
        response = connection.getresponse()
        if response.status != 200:
            raise ValueError(f"APITube returned HTTP {response.status}")
        body = response.read(MAX_RESPONSE_BYTES + 1)
        if len(body) > MAX_RESPONSE_BYTES:
            raise ValueError("APITube response exceeded the size limit")
    finally:
        connection.close()

    payload = json.loads(body)
    if not isinstance(payload, dict) or not isinstance(payload.get("results"), list):
        raise ValueError("APITube returned an unexpected response")

    headlines = []
    seen = set()
    for row in payload["results"]:
        if not isinstance(row, dict):
            continue
        title, description = row.get("title"), row.get("description")
        if not isinstance(title, str) or not MARKET_TERMS.search(f"{title} {description or ''}"):
            continue
        href = row.get("href") or row.get("url")
        if not isinstance(href, str):
            continue
        try:
            url = urlsplit(href)
        except ValueError:
            continue
        if url.scheme not in ("http", "https") or not url.hostname or url.username is not None:
            continue
        identity = (url.netloc.lower(), url.path.rstrip("/") or url.query)
        if identity in seen:
            continue
        seen.add(identity)

        source = row.get("source")
        source = source if isinstance(source, dict) else {}
        publisher = source.get("name") or source.get("domain")
        published_at = row.get("published_at")
        headlines.append({
            "title": title.strip(),
            "url": href,
            "publisher": publisher if isinstance(publisher, str) else url.hostname,
            "published_at": published_at if isinstance(published_at, str) else None,
        })
        if len(headlines) >= 10:
            break
    return headlines


class EdmontonNewsView(APIView):
    permission_classes = [HasPortalAccess]

    def get(self, request):
        if not settings.APITUBE_API_KEY:
            return Response({"detail": "Edmonton news is not configured."}, status=503)

        headlines = cache.get(CACHE_KEY)
        if headlines is not None:
            return Response({"results": headlines, "stale": False})

        # One worker refresh at a time. Keep a short cooldown after upstream failures.
        if cache.add(CACHE_KEY + ":refresh", True, timeout=300):
            try:
                headlines = fetch_headlines(settings.APITUBE_API_KEY)
            except (OSError, HTTPException, ValueError):
                pass
            else:
                cache.set(CACHE_KEY + ":stale", headlines, timeout=86400)
                cache.set(CACHE_KEY, headlines, timeout=21600)
                return Response({"results": headlines, "stale": False})

        stale = cache.get(CACHE_KEY + ":stale")
        if stale is not None:
            return Response({"results": stale, "stale": True})
        return Response({"detail": "Edmonton news is temporarily unavailable."}, status=503)
