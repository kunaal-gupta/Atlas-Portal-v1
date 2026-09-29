# Atlas Agent Portal

Atlas is an internal agent portal built as two independently managed applications:

```text
.
├── backend/                 # Django REST API and administration site
│   ├── apps/content/        # Portal domain models, API, admin, and tests
│   ├── config/              # Project-wide Django configuration
│   ├── manage.py
│   └── requirements.txt
├── frontend/                # React and Vite client
│   ├── src/pages/           # Route-level pages grouped by business area
│   ├── src/components/      # Layout and reusable interface components
│   ├── src/api/             # Typed backend API clients
│   ├── src/App.tsx          # Main application shell and page composition
│   ├── src/main.tsx         # Browser entry point
│   └── package.json
└── README.md
```

Keeping runtime code inside `frontend/` and `backend/` makes ownership, tooling, and deployment boundaries explicit. Generated dependencies and build outputs are not committed.

## Prerequisites

- Node.js 18 or newer
- Python 3.11 or newer

## Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The administration site is available at `http://localhost:8000/admin/` and the browsable API at `http://localhost:8000/api/`.

## Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The client runs at `http://localhost:3000/`. During development, Vite proxies `/api`, `/admin`, and `/media` requests to Django on port 8000.

## Verification

Run each application's checks from its own directory:

```bash
cd frontend && npm run build
cd backend && python manage.py test
```

## Configuration

The backend reads the following environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | Development-only key | Cryptographic signing key |
| `DJANGO_DEBUG` | `true` | Enables Django debug mode |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `DJANGO_TIME_ZONE` | `UTC` | Application time zone |

Uploaded files are written to `backend/media/`, and collected static assets to `backend/staticfiles/`; both directories are ignored by Git.

### Organizing document files

Administrators can organize documents into folders (including nested folders) from **Content management → Document folders**. A document can be placed in a folder when it is added or edited.

To upload existing directory trees in one step, open **Content management → Documents**, choose **Import folder**, and select the portal pages/categories. You can use the folder picker or drag several folders together onto the drop zone. A preview shows the complete tree before import, and drag-and-drop preserves nested and empty directories as well as their files.

When a local file is selected or imported, Atlas records the file's own last-modified timestamp as the document's **Updated date** instead of replacing it with the upload time. External links and uploads without browser file metadata fall back to the time they were added.

Portal users can search pages, documents, agents, and news from the global header. Document libraries also support file/folder filtering, name or modified-date sorting, an expandable folder grid, and a flat table view with directory and file metadata.

Document cards and table rows link to the permission-protected admin deletion confirmation. Library-level actions add top-level files or folders, while actions beside a folder preselect that folder as the new item's location or parent.

## API endpoints

- `GET /api/news/` with optional `?search=` filtering
- `GET /api/agents/` with optional `?search=` filtering
- `GET /api/documents/` with optional `?category=` filtering; each document includes its `folder_path`
