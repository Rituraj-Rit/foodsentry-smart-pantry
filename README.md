# FoodSentry

FoodSentry is a pantry tracker that helps you use ingredients before they expire. Track what you have, spot dates that need attention, find recipes from your pantry, and generate a practical recipe with Gemini.

## Features

- Email/password registration and login with bcrypt-hashed passwords and signed JWTs.
- User-scoped pantry CRUD, search, status filters, and expiry/name/recent sorting.
- Expiry status and dashboard summaries, plus deduplicated in-app expiry notifications.
- Ingredient-based Spoonacular recipe search and recipe details.
- Gemini-generated recipes with diet, cuisine, and serving preferences.
- Expired ingredients are marked clearly and blocked from AI recipe generation.
- Responsive React application with protected routes, accessible forms, persistent light/dark themes, and reduced-motion-aware transitions.
- Optional Gmail SMTP expiry reminders, grouped per user, sent at 09:00 in the configured app timezone and protected by unique notification records.

## Tech stack

React 19, Vite, React Router, Axios, React Toastify, Lucide, Motion; Node.js, Express 5, Mongoose, MongoDB, JWT, bcryptjs; Spoonacular and Google Gemini server-side REST APIs.

## Architecture

The repository is a small npm monorepo. The Express API owns authentication, authorization, persistence, validation, expiry classification, and external API calls. The React app communicates only with the FoodSentry API. API responses use `{ "success": true, "data": ... }` and `{ "success": false, "message": ... }` envelopes. Auth uses a bearer JWT persisted in browser `localStorage` for login persistence; use HTTPS, a restrictive CSP, and keep dependencies patched. A future deployment with higher XSS risk can migrate to short-lived access tokens plus HttpOnly/SameSite cookies and CSRF protection.

## Requirements

- Node.js 20 or newer (Node 18.17+ supports the runtime APIs used, but Node 20 LTS is recommended).
- npm.
- MongoDB local instance or an Atlas connection string.
- A Spoonacular API key for recipe search and a Gemini API key for generated recipes. The corresponding features return a clear configuration error until a key is set.

## Installation

From the project root:

```sh
npm run install:all
```

Create `server/.env` by copying `server/.env.example`, then set the variables described below. Start MongoDB locally or use MongoDB Atlas.

Optionally copy `client/.env.example` to `client/.env` and set `VITE_API_URL` if the API is not at its local default. Client variables are public build-time configuration only; never place API keys or other credentials in `VITE_*` variables.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port, defaults to `5000`. |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Long, random secret used to sign bearer tokens. |
| `JWT_EXPIRES_IN` | No | JWT lifetime, defaults to `7d`. |
| `SPOONACULAR_API_KEY` | For recipe search | Spoonacular API key. Stored only in `server/.env`. |
| `GEMINI_API_KEY` | For AI recipes | Google AI Studio Gemini API key. Stored only in `server/.env`. |
| `GEMINI_MODEL` | No | Gemini model ID, defaults to `gemini-3.8-flash`. |
| `CLIENT_URL` | No | Allowed browser origin, defaults to `http://localhost:5173`. |
| `EMAIL_USER` | For email reminders | Gmail address used by backend SMTP. |
| `EMAIL_APP_PASSWORD` | For email reminders | Gmail App Password; never use your normal Gmail password. |
| `APP_TIMEZONE` | No | Scheduler timezone, defaults to `Asia/Kolkata`; the job runs daily at 09:00. |
| `VITE_API_URL` | No | Client API base URL, defaults to `http://localhost:5000/api`. This is a public URL, never a secret. |

Never add real API keys to the client, commit `.env` files, or use a `VITE_` variable for a secret. The provided `.gitignore` excludes local environment files and keeps the `.env.example` templates trackable. Theme preference is saved in `localStorage`; first visit follows the OS color-scheme preference.

## Run locally

Run both applications from the root:

```sh
npm run dev
```

Or use separate terminals:

```sh
cd server
npm run dev
```

```sh
cd client
npm run dev
```

The client is served at `http://localhost:5173`; the API is at `http://localhost:5000`. Verify the API with `GET /api/health`.

Run only one application from the repository root when needed:

```sh
npm --prefix client run dev
npm --prefix server run dev
```

For a production client build:

```sh
npm run build
npm test
```

`npm test` runs the server's native Node test suite. Run it directly with `npm --prefix server test`.

Run the built client with `npm --prefix client run preview`. Start the API with `npm --prefix server start` after configuring production environment variables and a reachable MongoDB instance.

## External API setup

- **MongoDB:** start MongoDB locally (default example URI: `mongodb://127.0.0.1:27017/foodsentry`) or create an Atlas database and use its connection string.
- **Spoonacular:** create an API key in your Spoonacular account and set `SPOONACULAR_API_KEY`. The server uses Spoonacular's `GET /recipes/findByIngredients` and `GET /recipes/{id}/information` endpoints.
- **Gemini:** create a Gemini API key in Google AI Studio and set `GEMINI_API_KEY`. The server calls the Gemini `generateContent` REST endpoint and requests JSON output. The default model is configurable with `GEMINI_MODEL`.

Both integrations are made server-side with request timeouts, normalized results, and sanitized error messages. Usage limits and availability are controlled by the external providers and your account tiers.

## Free Email Notification Setup

FoodSentry can send one combined reminder when a user's enabled pantry items share an expiry date two calendar days away. The free Gmail SMTP setup is intended for a small portfolio or personal app; Gmail account sending limits apply.

1. Create or use a Gmail account for the application.
2. Enable 2-Step Verification for that account.
3. In Google Account settings, create an App Password for FoodSentry. Google only offers App Passwords when 2-Step Verification is enabled; follow Google's current account-security instructions if the option is unavailable.
4. Put the sender Gmail address in `EMAIL_USER` in `server/.env`.
5. Put the generated App Password in `EMAIL_APP_PASSWORD` in `server/.env`.
6. Set `APP_TIMEZONE=Asia/Kolkata` (or another valid IANA timezone) and ensure `CLIENT_URL` points at the frontend.
7. Start the backend. After MongoDB connects, it schedules the reminder check daily at 09:00 in `APP_TIMEZONE`.

Example values (use your own secrets locally):

```dotenv
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
APP_TIMEZONE=Asia/Kolkata
```

Never put a normal Gmail password in `.env`, source code, API responses, or client configuration. Email credentials stay on the server and are not returned by any endpoint. The server logs delivery outcome/error codes only. After registration or the first login without a saved choice, FoodSentry asks whether the user wants email reminders. Choosing Yes records explicit consent and enables reminders; choosing No records the choice and leaves reminders off. The database field `emailNotificationsEnabled` still defaults to `true` as configured, while `emailNotificationConsentGiven` defaults to `false`; the scheduler requires both explicit consent and an enabled preference before delivery. Users can change the setting later in Profile. Failed reminders can retry on the next run while the affected expiry date has not passed.

## API documentation

The frontend's primary API paths are rooted at `/` (for example, `/auth/register` and `/pantry`). Matching `/api/*` aliases are retained for local development and existing clients. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Health check. |
| `POST` | `/auth/register` | Public | `{ name, email, password }`; returns user and token. |
| `POST` | `/auth/login` | Public | `{ email, password }`; returns user and token. |
| `GET` | `/auth/me` | Protected | Current user profile. |
| `GET` | `/pantry` | Protected | Lists pantry items; accepts `search`, `status`, `category`, and `sort`. |
| `POST` | `/pantry` | Protected | Creates an ingredient. |
| `GET` | `/pantry/:id` | Protected | Reads an owned ingredient only. |
| `PUT` | `/pantry/:id` | Protected | Updates an owned ingredient only. |
| `DELETE` | `/pantry/:id` | Protected | Deletes an owned ingredient only. |
| `GET` | `/recipes/search?ingredients=tomato,onion` | Protected | Searches Spoonacular by ingredients. |
| `GET` | `/recipes/:id` | Protected | Loads recipe detail from Spoonacular. |
| `POST` | `/ai/generate-recipe` | Protected | Generates a recipe from `{ ingredients, diet, cuisine, servings }`. |
| `GET` | `/notifications/preferences` | Protected | Reads the user's email reminder preference. |
| `PUT` | `/notifications/preferences` | Protected | Updates `{ emailNotificationsEnabled: true|false }`. |
| `POST` | `/notifications/test-expiry-email` | Protected, non-production only | Sends a test message for `{ pantryItemIds: [...] }`; respects the user's opt-out. |

Pantry statuses are `EXPIRED`, `EXPIRING_SOON`, `EXPIRING_THIS_WEEK`, and `FRESH`. Recipe search accepts up to 20 comma-separated ingredients. AI generation accepts 1-20 ingredient strings and 1-12 servings. Requests are validated at the API boundary.

## Folder structure

```text
client/                 React application
  src/components/       Shared UI
  src/context/          Authentication state
  src/hooks/            Reusable expiry alerts
  src/layouts/          Authenticated application shell
  src/pages/            Public and protected pages
  src/services/         Axios API client
  src/utils/            Client expiry helpers
server/                 Express API
  config/               MongoDB connection
  controllers/          Request handlers
  middleware/           Authentication, validation, errors
  models/               User, pantry, and notification schemas
  routes/               REST route definitions
  services/             Spoonacular, Gemini, Gmail, and expiry-notification logic
  jobs/                 Daily timezone-aware expiry reminder scheduler
  utils/                Expiry, async, response helpers
```

## Screenshots

Screenshots can be added here after running the application.

## Deployment

1. Provision MongoDB Atlas (or another reachable MongoDB deployment), then deploy `server/` to a Node.js host. Set `NODE_ENV=production`, `MONGODB_URI`, a unique high-entropy `JWT_SECRET`, the desired `JWT_EXPIRES_IN`, provider keys, and optional Gmail SMTP credentials in the host's secret manager. Do not upload `.env` files.
2. Set `CLIENT_URL` to the exact deployed frontend origin. Configure the host to expose the Express port and terminate TLS at the platform or reverse proxy. The API exits on startup when MongoDB cannot connect, so configure health checks against `/api/health` after the database is available.
3. Build `client/` with `VITE_API_URL` set to the deployed API's `/api` URL, then host the generated `client/dist/` as static assets. Configure SPA fallback/rewrite to `index.html` so direct route loads work.
4. Configure provider quotas and billing/usage alerts. Test account creation, protected pantry CRUD, CORS, and both integrations against the deployed environment before inviting users.

The included bearer-token persistence is suitable for this portfolio app but is exposed to browser JavaScript. For a higher-risk public deployment, prefer HttpOnly/SameSite cookies with CSRF defenses, add request monitoring and backups, and review the applicable privacy and food-safety requirements.

## Future improvements

- Refresh-token rotation and optional email verification.
- Automated pantry reminders via email or push notifications.
- Pagination and richer pantry category analytics.
- Integration tests against an isolated MongoDB test database.

## Author

FoodSentry portfolio project.
