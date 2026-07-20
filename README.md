# CatPair

A full-stack cat adoption and rehoming platform. Owners publish listings for
cats that need a home; adopters browse and filter them, then reach the owner
through built-in real-time chat. A community feed lets users share posts.

Live demo: https://cat-pair.vercel.app

## Features

- **Listings** — create cat listings with multiple photos, breed, city, gender,
  price type (free or for sale), and description. Listings can be filtered by
  breed and city and moved through statuses (for example active or adopted).
- **Real-time chat** — one-to-one chat between users backed by Server-Sent
  Events, so new messages arrive without polling.
- **Community feed** — users publish and browse short posts.
- **Authentication** — stateless JWT auth with registration, login, and roles.
- **Profiles** — editable user profile with the user's own listings.
- **Reference data** — seeded breed and city dictionaries used across the app.
- **Photo storage** — uploaded images are stored on the server filesystem and
  served back to the client.

## Tech stack

**Backend**
- Java 25, Spring Boot
- Spring Security with JWT (stateless authentication)
- Spring Data JPA over PostgreSQL
- Server-Sent Events for chat delivery
- Maven

**Frontend**
- React 19 with React Router
- Vite build tooling
- Tailwind CSS
- Zustand for state, Axios for HTTP, React Toastify for notifications

## Architecture

A single-page app plus a REST API:

- The React SPA talks to the Spring Boot API over `/api/*`.
- Authentication is stateless: the API issues a JWT on login and the SPA sends
  it as a Bearer token. A `JwtAuthenticationFilter` validates it per request.
- Chat uses an SSE stream (`GET /api/sse/subscribe`) plus REST endpoints for
  sending and loading messages; an in-memory emitter registry fans messages out
  to connected clients.
- Listing photos are saved to a configurable upload directory on the server.

## Getting started

### With Docker Compose

The stack (PostgreSQL, backend, frontend) runs from `docker-compose.yml`, but it
deliberately ships no default database password or JWT secret. Create a `.env`
in the project root first (see `.env.example`):

```env
DB_USERNAME=catpair
DB_PASSWORD=change-me
JWT_SECRET=replace-with-a-long-random-string
APP_PORT=80
CORS_ALLOWED_ORIGINS=http://localhost
```

Then:

```bash
docker compose up --build
```

The app is served on `http://localhost:${APP_PORT}` (80 by default).

### Running locally without Docker

1. Start PostgreSQL and create a `catpair` database.
2. Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET`, then run the
   backend:
   ```bash
   ./mvnw spring-boot:run
   ```
3. In `frontend/`, copy `.env.example` to `.env` (it defaults to
   `http://localhost:8080/api`) and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

## Project structure

```
src/main/java/com/Aibek/CatPair/
  auth/        registration, login, JWT issuing
  security/    Spring Security config, JWT filter and service
  listing/     cat listings, photos, filtering, status
  chat/        SSE stream, chats, messages
  post/        community feed
  dictionary/  seeded breeds and cities
  user/        profiles and roles
frontend/      React + Vite SPA
```
