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
| `MICROSOFT_TENANT_ID` | — | Microsoft Entra tenant (directory) ID |
| `MICROSOFT_CLIENT_ID` | — | Client ID for the Atlas calendar app registration |
| `MICROSOFT_CLIENT_SECRET` | — | Server-only client secret for the app registration |
| `OUTLOOK_CALENDAR_MAILBOX` | `technology@mozaicrealty.ca` | Microsoft 365 mailbox whose default calendar is shown |
| `DEFAULT_FROM_EMAIL` | `Atlas Portal <no-reply@localhost>` | Sender shown on one-time-code emails |
| `EMAIL_BACKEND` | Django console backend | Django email backend (use SMTP in production) |
| `EMAIL_HOST` / `EMAIL_PORT` | `localhost` / `25` | SMTP server used by the SMTP backend |
| `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | — | SMTP credentials |
| `EMAIL_USE_TLS` | `false` | Enables SMTP STARTTLS when set to `true` |

### Passwordless portal access

Atlas requires an approved email address and a six-digit, single-use login code.
Codes expire after 10 minutes, are stored only as password hashes, allow no more
than five attempts, and are rate-limited to one code per user per minute.

To provision someone, a superuser first creates their Django user under
**Authentication and Authorization → Users**, ensuring the email address is
correct. Then add a record under **Content → Portal user access** and choose:

- **Read-only** — can view portal content and calendar events.
- **Write access** — can additionally create, edit, and delete calendar events.

Turn off **Is enabled** to revoke access immediately. Only superusers can view or
change these access records. For local development, login emails appear in the
Django server console. Production must configure a working email backend, for
example `django.core.mail.backends.smtp.EmailBackend` with the SMTP variables
above.

### Outlook calendar connection

The Resources → Calendar page reads and writes the mailbox's Outlook calendar
directly through Microsoft Graph. Events created, edited, or deleted in Atlas
therefore appear in Outlook immediately, and Outlook changes appear in Atlas on
refresh. Microsoft credentials are used only by Django and are never sent to the
browser.

To connect the production Microsoft 365 tenant:

1. In **Microsoft Entra admin center**, register an application for Atlas.
2. Add the Microsoft Graph **Application** permission `Calendars.ReadWrite` and
   grant tenant-wide admin consent. For least privilege, an Exchange administrator
   should also apply an application access policy that restricts the app to the
   `technology@mozaicrealty.ca` mailbox.
3. Create a client secret (or rotate the existing one), then set the four
   environment variables above on the Django service and restart it.
4. Open the Calendar page and use its refresh button to verify the connection.

Do not put the client secret in Vite variables, source control, or browser-side
code. Rotate it according to the organization's Microsoft 365 credential policy.

Uploaded files are written to `backend/media/`, and collected static assets to `backend/staticfiles/`; both directories are ignored by Git.

### Organizing document files

Administrators can organize documents into folders (including nested folders) from **Content management → Document folders**. A document can be placed in a folder when it is added or edited.

To upload existing directory trees in one step, open **Content management → Documents**, choose **Import folder**, and select the portal pages/categories. You can use the folder picker or drag several folders together onto the drop zone. A preview shows the complete tree before import, and drag-and-drop preserves nested and empty directories as well as their files.

When a local file is selected or imported, Atlas records the file's own last-modified timestamp as the document's **Updated date** instead of replacing it with the upload time. External links and uploads without browser file metadata fall back to the time they were added.

Portal users can search pages, documents, agents, and news from the global header. Document libraries also support file/folder filtering, name or modified-date sorting, an expandable folder grid, and a flat table view with directory and file metadata.

Document cards and table rows link to the permission-protected admin deletion confirmation. Library-level actions add top-level files or folders, while actions beside a folder preselect that folder as the new item's location or parent.

## API endpoints

- `GET` or `DELETE /api/auth/session/` reads or ends the current session
- `POST /api/auth/request-code/` sends a one-time login code to an approved user
- `POST /api/auth/verify-code/` verifies a code and starts the session
- `GET /api/news/` with optional `?search=` filtering
- `GET /api/agents/` with optional `?search=` filtering
- `GET /api/documents/` with optional `?category=` filtering; each document includes its `folder_path`
- `GET /api/calendar/events/?start=<ISO>&end=<ISO>` lists live Outlook events
- `POST /api/calendar/events/` creates an Outlook event
- `PATCH` or `DELETE /api/calendar/events/<event-id>/` updates or deletes an Outlook event


## Planning calculators and dashboard metadata

The Numbers → Calculators provides browser-only CAD mortgage and commission estimates. Mortgage defaults use nominal rates compounded semiannually, with configurable payment frequency, amortization, term, financed insurance premium, extra payments, and ownership costs. The schedule assumes the entered rate continues after the selected term. Insurance eligibility/premiums and lender qualification are not determined automatically. Commission rates are editable illustrations; referral is deducted from the selected side before the brokerage split, then fixed agent costs are deducted. GST/HST on commission is separate from agent earnings.

Run the financial/reporting tests on Node 22.6+ (verified on Node 24):

```bash
node --experimental-strip-types frontend/src/lib/calculators.test.ts
```

The optional `/api/skyslope/numbers/` response supports `dataMode: "live" | "cached"` and an ISO `updatedAt` timestamp with a time-zone offset. Without a declared mode, the UI labels returned numbers as an API snapshot with unknown freshness. Missing timestamps are shown as not provided; retrieval time is separate from source update time. When the endpoint is unavailable or invalid, the UI explicitly identifies demonstration data. This repository does not currently implement that backend endpoint.

Announcement deadlines in `frontend/src/data/announcements.ts` require a verified ISO date (`dueDate`, e.g. `2026-09-30`) and `deadlineVerified: true` before they can be marked overdue. Date boundaries use America/Edmonton. The original September 30 FINTRAC sample has no confirmed year and remains unverified; its Review now link opens the existing FINTRAC resource page, not an acknowledgement-submission workflow.

## My Atlas, neighbourhood research, and support

Apply migrations (`python backend/manage.py migrate`) before running this version. My Atlas stores bookmarks, saved-file references, the last five opened pages/files, and a self-tracked training checklist against the authenticated account. Saved files remain links to the original files; they are not copied or granted additional permissions. Tool favourites continue to use the existing account-scoped browser preferences, as labelled in the UI. Training checkboxes are personal learning notes, not verified course or compliance completion.

- `GET /api/workspace/` reads the current user's saved resources, recent activity, and training checklist.
- `POST /api/workspace/` accepts `url`, `title`, `kind` (`page`/`file`), and optional `saved`. Without `saved`, it records a visit; with `saved`, it saves/removes a bookmark without marking a visit.
- `POST /api/workspace/training/` accepts a known training `course` and boolean `completed`.
- `GET/POST /api/support/` lists the current agent's requests or submits a new request. List filters: `department`, `status`, `page`.
- `GET/POST /api/support/<id>/` reads the request history or adds a message. Superusers can also update `status` and view all requests; ordinary write/calendar permission does not grant access to other agents' requests. Department is a queue classification, not an email notification. No email is sent by this workflow. Support administrators work through My Atlas → Support Desk.

Neighbourhood Intelligence starts with six curated Edmonton community profiles and links to school boards, City maps/projects, market research, maps, and listings. It is not a live market or construction feed or a complete regional directory. Personal Performance is explicitly planned and does not display private transaction figures until an authorized reporting integration and agent mapping are implemented.

Backend verification: `python backend/manage.py test apps.content` includes request ownership, disabled-user access, administrator-only status changes, history, pagination, workspace isolation, URL validation, and training validation.
