<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Mozaic Agent Portal

The portal now combines the existing React/Vite interface with a Django REST backend and Django's full content-management admin. News, categorized resources, file uploads, and calendar events can be managed without changing code.

View your app in AI Studio: https://ai.studio/apps/drive/1Zs3AP58b3sim10f60Zy0cPbGviyLCw6F

## Run Locally

**Prerequisites:** Node.js 18+ and Python 3.11+


1. Install frontend dependencies: `npm install`
2. Install backend dependencies: `python -m pip install -r requirements.txt`
3. Prepare the database: `python manage.py migrate`
4. Create an administrator: `python manage.py createsuperuser`
5. Start Django: `python manage.py runserver`
6. In another terminal, start the UI: `npm run dev`

The admin is available at `http://localhost:8000/admin/`; the browsable API is at `http://localhost:8000/api/`. Vite proxies `/api`, `/admin`, and `/media` to Django in development. Set `API_KEY` in `.env.local` to enable the Gemini assistant.

## API

- `GET /api/news/` and `/api/news/featured/`
- `GET /api/categories/`
- `GET /api/events/` and `/api/events/upcoming/`

Production configuration is environment-driven through `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, and `DJANGO_TIME_ZONE`. Uploaded files live under `media/`; static assets are served by WhiteNoise after `python manage.py collectstatic`.
