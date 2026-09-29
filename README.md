# FoodSentry

FoodSentry is a pantry tracker that helps you use ingredients before they expire. Track what you have, spot dates that need attention, find recipes from your pantry, and generate a practical recipe with Gemini.

## Features

- Email/password registration and login with bcrypt-hashed passwords and signed JWTs.
- User-scoped pantry CRUD, search, status filters, and expiry/name/recent sorting.
- Expiry status and dashboard summaries, plus deduplicated in-app expiry notifications.
- Ingredient-based Spoonacular recipe search and recipe details.
- Gemini-generated recipes with diet, cuisine, and serving preferences.
- Expired ingredients are marked clearly and blocked from AI recipe generation.
- Responsive React application with protected routes and accessible forms.

## Tech stack

React 19, Vite, React Router, Axios, React Toastify, Lucide; Node.js, Express 5, Mongoose, MongoDB, JWT, bcryptjs; Spoonacular and Google Gemini server-side REST APIs.

## Architecture

The repository is a small npm monorepo. The Express API owns authentication, authorization, persistence, validation, expiry classification, and external API calls. The React app communicates only with the FoodSentry API. API responses use `{ "success": true, "data": ... }` and `{ "success": false, "message": ... }` envelopes.

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
| `VITE_API_URL` | No | Client API base URL, defaults to `http://localhost:5000/api`. This is a public URL, never a secret. |

Never add real API keys to the client, commit `.env` files, or use a `VITE_` variable for a secret. The provided `.gitignore` excludes local environment files.

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

For a production client build:

```sh
npm run build
```

Run the built client with `npm --prefix client run preview`. Start the API with `npm --prefix server start` after configuring production environment variables and a reachable MongoDB instance.

## External API setup

- **MongoDB:** start MongoDB locally (default example URI: `mongodb://127.0.0.1:27017/foodsentry`) or create an Atlas database and use its connection string.
- **Spoonacular:** create an API key in your Spoonacular account and set `SPOONACULAR_API_KEY`. The server uses Spoonacular's `GET /recipes/findByIngredients` and `GET /recipes/{id}/information` endpoints.
- **Gemini:** create a Gemini API key in Google AI Studio and set `GEMINI_API_KEY`. The server calls the Gemini `generateContent` REST endpoint and requests JSON output. The default model is configurable with `GEMINI_MODEL`.

Both integrations are made server-side with request timeouts, normalized results, and sanitized error messages. Usage limits and availability are controlled by the external providers and your account tiers.

## API documentation

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Health check. |
| `POST` | `/auth/register` | Public | `{ name, email, password }`; returns user and token. |
| `POST` | `/auth/login` | Public | `{ email, password }`; returns user and token. |
| `GET` | `/auth/me` | Protected | Current user profile. |
| `GET` | `/pantry` | Protected | Lists pantry items; accepts `search`, `status`, `sort`. |
| `POST` | `/pantry` | Protected | Creates an ingredient. |
| `GET` | `/pantry/:id` | Protected | Reads an owned ingredient only. |
| `PUT` | `/pantry/:id` | Protected | Updates an owned ingredient only. |
| `DELETE` | `/pantry/:id` | Protected | Deletes an owned ingredient only. |
| `GET` | `/recipes/search?ingredients=tomato,onion` | Protected | Searches Spoonacular by ingredients. |
| `GET` | `/recipes/:id` | Protected | Loads recipe detail from Spoonacular. |
| `POST` | `/ai/generate-recipe` | Protected | Generates a recipe from `{ ingredients, diet, cuisine, servings }`. |

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
  models/               Mongoose user and pantry schemas
  routes/               REST route definitions
  services/             Spoonacular and Gemini integrations
  utils/                Expiry, async, response helpers
```

## Screenshots

Screenshots can be added here after running the application.

## Future improvements

- Refresh-token rotation and optional email verification.
- Automated pantry reminders via email or push notifications.
- Pagination and richer pantry category analytics.
- Integration tests against an isolated MongoDB test database.

## Author

FoodSentry portfolio project.
