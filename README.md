# Product management frontend

React + TypeScript + Vite frontend for Laboratory Exercise No. 6. It provides
login, a searchable product list, product creation/editing/deletion, admin-only
user creation, and logout.
All product requests go through the LavaLust API; this app never connects to
MySQL directly.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Leave `VITE_API_BASE_URL` empty for local development. Vite proxies `/api`
   to `http://localhost/lab6/backend/public`, avoiding browser CORS issues.
4. Start Vite with `npm run dev`. Restart the dev server after changing env
   variables or Vite configuration.

Set the backend's `FRONTEND_URL` to the frontend origin in production.
Create an active user in the backend's `users` table with a password created
using PHP `password_hash()` before signing in. The backend also requires the
`users` and `refresh_tokens` tables.

## API contract

The frontend expects the following routes under the configured base URL:

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | No | Accepts `{ "identifier": "username-or-email", "password": "..." }` (legacy `email` is also accepted); returns an access token in `access_token` or `tokens.access_token` |
| POST | `/api/users` | Admin bearer token | Creates a standard user from `username`, `email`, and `password` |
| GET | `/api/products` | Bearer token | Returns a product array, `{ "products": [...] }`, or `{ "data": [...] }` |
| POST | `/api/products` | Bearer token | Creates a product from `product_name`, `description`, `price`, and `quantity` |
| PUT | `/api/products/{id}` | Bearer token | Replaces the product fields |
| DELETE | `/api/products/{id}` | Bearer token | Deletes the product |

Login returns a `user` object with `username`, `email`, and `role` for the
signed-in profile. The login page has a create-user form that verifies admin
credentials before submitting; the backend independently enforces this
authorization. The login sticky note shows the local demo credentials
(`admin@example.com` / `password`). Do not use this public demo password
outside local development; change it immediately for any deployed environment.
Standard `user` accounts can view products but cannot add, edit, or delete
them. The frontend hides these controls and the backend independently rejects
write requests without the required role scope.

## Build

Run `npm run build` to type-check and create a production build in `dist/`.
Set `VITE_API_BASE_URL` to the deployed LavaLust API URL when building for
deployment; production builds require this value.
