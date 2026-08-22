# CRM Admin — Frontend

Next.js admin panel for the **Voice Agent Survey / Calling CRM** platform. Manage surveys (voice agents), contacts, calls, responses, users, and roles from a single dashboard.

Pairs with the backend at `calling-crm-backend` (`/api/v1`).

## Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework   | Next.js 16 (App Router) + Turbopack  |
| UI          | React 19, Tailwind CSS 4, Radix UI   |
| Forms       | React Hook Form + Zod                |
| Data        | TanStack Query, Axios                |
| State       | Zustand                              |
| Charts      | Recharts                             |
| Drag & drop | dnd-kit                              |
| Uploads     | Cloudinary                           |
| Language    | TypeScript                           |

## Features (by sidebar)

### Survey Studio
- **My Surveys** — list, search, schedule, duplicate, delete voice survey agents
- **Create Survey** — multi-step agent setup (persona, prompts, survey questions, contacts, schedule, and more)
- **Voices / Audio Buffer** — voice library and audio assets
- **Survey Data** — customer / contact data for campaigns

### Insights
- **Reports** — campaign and call analytics

### Management
- **Users** — create, edit, and manage team members
- **Roles** — RBAC roles & permissions (aligned with backend modules)

### Configurations
- **Notifications**, **Activity Logs**, **Settings**

Auth routes: `/login`, `/forgot-password`, `/reset-password`. Root `/` redirects to `/dashboard`.

## Project Structure

```
Call-frontend/
├── public/                 # Static assets (audio, images)
├── scripts/                # Helper scripts
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login & password flows
│   │   ├── (dashboard)/    # Authenticated pages (survey, calls, users, …)
│   │   ├── api/            # Next.js API routes (BFF / proxies)
│   │   ├── layout.tsx
│   │   └── page.tsx        # Redirect → /dashboard
│   ├── api/                # Client API helpers & endpoint map
│   ├── components/         # UI by domain (survey, users, roles, layout, …)
│   ├── config/             # Site, nav, permissions, API config
│   ├── hooks/
│   ├── lib/                # Auth, validators, mappers, mock data
│   ├── services/           # Module services (surveys, roles, …)
│   ├── stores/             # Zustand stores (auth, etc.)
│   ├── types/
│   └── middleware.ts       # Cookie-based auth gate
├── .env.example
├── next.config.ts
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 18+
- Backend running (default: `http://localhost:8000/api/v1`)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

```env
# API (calling-crm-backend)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000

# Auth cookie / storage keys
NEXT_PUBLIC_AUTH_TOKEN_KEY=crm_auth_token
NEXT_PUBLIC_AUTH_REFRESH_KEY=crm_refresh_token

# Cloudinary (survey contact file uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=survey-contacts
```

### 3. Start the app

```bash
# Development (Turbopack)
npm run dev

# Production build
npm run build
npm start
```

App runs at: [http://localhost:3000](http://localhost:3000)

### 4. Sign in

Open `/login`. Dev login defaults (same as backend seed):


> Middleware protects dashboard routes via the auth cookie (`crm_auth_token`). Unauthenticated users are redirected to `/login`.

## Scripts

| Command            | Description                |
|--------------------|----------------------------|
| `npm run dev`      | Dev server with Turbopack  |
| `npm run build`    | Production build           |
| `npm start`        | Serve production build     |
| `npm run lint`     | ESLint                     |
| `npm run typecheck`| TypeScript (`tsc --noEmit`)|

## Key routes

| Path                         | Purpose                          |
|------------------------------|----------------------------------|
| `/login`                     | Sign in                          |
| `/dashboard`                 | Overview                         |
| `/survey`                    | My Surveys                       |
| `/survey/new`                | Create survey agent              |
| `/survey/[id]`               | Survey detail                    |
| `/survey/[id]/configure`     | Configure agent tabs             |
| `/library/voices`            | Voices                           |
| `/library/audio-buffer`      | Audio buffer                     |
| `/customers`                 | Survey / contact data            |
| `/reports`                   | Reports                          |
| `/users`, `/roles`           | Users & roles                    |
| `/notifications`             | Notifications                    |
| `/activity-logs`             | Activity logs                    |
| `/settings`                  | Settings                         |

## Survey configure flow

Creating or editing a survey uses step tabs, including:

1. **Persona** — agent identity  
2. **Prompts** — conversation prompts  
3. **Functions** — call functions / branching  
4. **Survey questions** — manual questions and/or CSV/Excel upload (**any columns** saved as-is; no fixed `question` / `type` / `options` requirement)  
5. **Client contact** — CSV/Excel upload to Cloudinary (**any columns** saved as-is; preview table is dynamic)  
6. **Schedule** — when to run the campaign  
7. **Wisdom / Post-call** — additional agent steps  

List actions include schedule, unschedule, duplicate, and delete via `/api/surveys/*` routes.

### Dynamic file uploads

Questions and contact steps accept `.csv` / `.xlsx` / `.xls`. Whatever headers are in the file are stored on each row. Sample download buttons in the UI are optional references only — custom column names work without mapping.

## API layer

Browser calls go through Next.js `src/app/api/*` routes (see `src/api/endpoints.ts`), which talk to the backend `NEXT_PUBLIC_API_URL`.

Example survey endpoints:

```
GET/POST   /api/surveys
GET/PATCH/DELETE  /api/surveys/:id
POST       /api/surveys/:id/duplicate
POST       /api/surveys/:id/schedule
POST       /api/surveys/:id/unschedule
GET/POST   /api/surveys/:id/contact-file
GET/POST   /api/surveys/:id/questions-file
```

## Related repo

| Repo                   | Role                          |
|------------------------|-------------------------------|
| `Call-frontend`        | This Next.js admin UI         |
| `calling-crm-backend`  | Express + MongoDB API (`/api/v1`) |

See the backend README for seed users, RBAC modules, and API response format.
