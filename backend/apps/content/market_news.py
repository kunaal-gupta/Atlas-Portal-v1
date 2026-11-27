"""Edmonton headlines from APITube and Google News RSS, with a shared cache per Django worker."""

import json
import logging
import re
from email.utils import parsedate_to_datetime
from xml.etree import ElementTree
from http.client import HTTPException, HTTPSConnection
from urllib.parse import urlencode, urlsplit

from django.conf import settings
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import HasPortalAccess

logger = logging.getLogger(__name__)


class NewsResponseError(Exception):
    """A provider response that could not be used."""


MARKET_TERMS = re.compile(
    r"\b(real estate|housing|rentals?|condos?|condominiums?|mortgages?|"
    r"residential development|home (?:sales|prices|buyers|building)|"
    r"homes|realtors?|property (?:sales|prices|market))\b",
    re.IGNORECASE,
)
CACHE_KEY = "atlas:edmonton-market-news:v2"
MAX_RESPONSE_BYTES = 4 * 1024 * 1024


def read_feed(host, path, headers):
    connection = HTTPSConnection(host, timeout=4)
    try:
        connection.request("GET", path, headers=headers)
        response = connection.getresponse()
        if response.status != 200:
            raise NewsResponseError(f"HTTP {response.status}")
        body = response.read(MAX_RESPONSE_BYTES + 1)
        if len(body) > MAX_RESPONSE_BYTES:
            raise NewsResponseError("Response exceeded the size limit")
    finally:
        connection.close()
    return body


def fetch_headlines(api_key):
    query = urlencode({
        "title": "Edmonton",
        "language.code": "en",
        "per_page": 10,
    })
    body = read_feed("api.apitube.io", f"/v1/news/everything?{query}", {
        "Accept": "application/json",
        "X-API-Key": api_key,
    })
    payload = json.loads(body)
    if not isinstance(payload, dict) or not isinstance(payload.get("results"), list):
        raise NewsResponseError("Unexpected response format")

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


class FeedTreeBuilder(ElementTree.TreeBuilder):
    def doctype(self, name, pubid, system):
        raise NewsResponseError("Unexpected XML document type")


def fetch_google_headlines():
    query = urlencode({"q": "Edmonton real estate when:30d", "hl": "en-CA", "gl": "CA", "ceid": "CA:en"})
    body = read_feed("news.google.com", f"/rss/search?{query}", {"Accept": "application/rss+xml"})
    root = ElementTree.fromstring(body, parser=ElementTree.XMLParser(target=FeedTreeBuilder()))
    channel = root.find("channel")
    if channel is None:
        raise NewsResponseError("Unexpected RSS format")

    headlines = []
    seen = set()
    for item in channel.findall("item"):
        title = item.findtext("title", "").strip()
        publisher = item.findtext("source", "").strip()
        href = item.findtext("link", "").strip()
        try:
            link = urlsplit(href)
        except ValueError:
            continue
        identity = title.casefold()
        if not title or identity in seen or link.scheme != "https" or link.netloc != "news.google.com":
            continue
        seen.add(identity)
        try:
            date = parsedate_to_datetime(item.findtext("pubDate", ""))
        except (ValueError, TypeError, OverflowError):
            date = None
        suffix = f" - {publisher}"
        headlines.append({
            "title": title.removesuffix(suffix) if publisher else title,
            "url": href,
            "publisher": publisher or "Google News",
            "published_at": date.isoformat() if date else None,
        })
        if len(headlines) >= 10:
            break
    return headlines


def refresh_headlines():
    if settings.APITUBE_API_KEY:
        try:
            headlines = fetch_headlines(settings.APITUBE_API_KEY)
            if headlines:
                return headlines
        except NewsResponseError as error:
            logger.warning("APITube Edmonton news refresh failed: %s", error)
        except (OSError, HTTPException, ValueError) as error:
            logger.warning("APITube Edmonton news refresh failed: %s", type(error).__name__)
    try:
        return fetch_google_headlines()
    except NewsResponseError as error:
        logger.warning("Google News Edmonton refresh failed: %s", error)
    except (OSError, HTTPException, ValueError, ElementTree.ParseError) as error:
        logger.warning("Google News Edmonton refresh failed: %s", type(error).__name__)
    return None


class EdmontonNewsView(APIView):
    permission_classes = [HasPortalAccess]

    def get(self, request):
        headlines = cache.get(CACHE_KEY)
        if headlines is not None:
            return Response({"results": headlines, "stale": False})

        # One worker refresh at a time. Keep a short cooldown after upstream failures.
        if cache.add(CACHE_KEY + ":refresh", True, timeout=300):
            headlines = refresh_headlines()
            if headlines:
                cache.set(CACHE_KEY + ":stale", headlines, timeout=86400)
                cache.set(CACHE_KEY, headlines, timeout=21600)
                return Response({"results": headlines, "stale": False})

        stale = cache.get(CACHE_KEY + ":stale")
        if stale is not None:
            return Response({"results": stale, "stale": True})
        if headlines == []:
            cache.set(CACHE_KEY, [], timeout=900)
            return Response({"results": [], "stale": False})
        return Response({"detail": "Edmonton news is temporarily unavailable."}, status=503)
