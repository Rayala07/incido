# Incido — Incident Response Assistant

Short, production-ready starter for incident response workflows with RAG-powered search, OAuth auth, and horizontal deploy patterns using Docker + Nginx.

**Status:** Docker/dev stack builds and runs locally; Redis, Mongo, Nginx, backend and frontend are wired for horizontal scaling.

---

**Contents**

- Project overview
- Features
- Architecture & tech decisions
- Quick start (dev)
- Docker (dev & prod)
- Environment variables
- Production checklist & scaling notes
- Troubleshooting
- Where to find things

---

**Project overview**

Incido is an incident management platform scaffolded for fast development and product readiness. It combines:

- An Express (Node.js) API providing auth, incident, project endpoints
- React + Vite frontend (single-page app)
- Google OAuth signin via Passport

# Incido — Incident Response Assistant

Short, production-ready starter for incident response workflows with RAG-powered search, OAuth auth, and containerized deployment patterns using Docker + Nginx.

**Status:** Docker/dev stack builds and runs locally; Redis, Mongo, Nginx, backend and frontend are wired for horizontal scaling.

---

Table of contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture & Decisions](#architecture--decisions)
- [Quick Start (Dev)](#quick-start-dev)
- [Docker & Production](#docker--production)
- [Environment Variables](#environment-variables)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)
- [Developer Map (important files)](#developer-map-important-files)
- [Next Steps](#next-steps)

---

## Project Overview

Incido is an incident management platform scaffolded for fast development and product readiness. It combines:

- An Express (Node.js) API providing auth, incident, and project endpoints
- React + Vite frontend (single-page app)
- Google OAuth signin via Passport
- RAG (retrieve-and-read) pipeline using embeddings, Pinecone, and GenAI
- MongoDB for primary storage, Redis for distributed rate-limiting and caching
- Docker + Nginx for containerized deployment and load balancing

## Features

- Role-based account creation (admin / user) and project roles (leader/member)
- Google OAuth with role capture
- JWT auth + secure cookies (configurable for prod)
- Distributed rate limiting via Redis
- RAG search over incidents (Pinecone embeddings + model inference)
- Helmet security headers and basic hardening

## Architecture & Decisions

- Node.js 20 (backend) — chosen for compatibility with modern packages like LangChain and Pinecone.
- Express.js for a lightweight, flexible API.
- MongoDB + Mongoose for primary data store; sessions persisted via `connect-mongo`.
- Redis (ioredis) for distributed rate limiting and ephemeral caching.
- Nginx as the reverse-proxy / load-balancer; Nginx is the only public service in production compose.
- Frontend built with Vite + React and served statically by Nginx in production.
- Docker Compose for local dev and `docker-compose.prod.yml` for production-like testing.

Rationale: keep backend stateless so instances can scale horizontally; centralize stateful concerns in Mongo/Redis and put Nginx at the front.

---

## Quick Start (Dev)

Prerequisites:

- Docker & Docker Compose
- (Optional) Node 20 for local frontend builds

1. Clone repository and open the project root.
2. Copy environment template and set secrets (do NOT commit `.env`):

```bash
cp backend/.env.example backend/.env
# edit backend/.env with your values
```

3. Build & run the local dev stack (starts Redis, Mongo, backend, frontend build, and Nginx):

```bash
docker-compose up --build -d
docker-compose logs -f nginx backend redis
```

4. Verify health:

```bash
curl http://localhost/api/health
```

Notes:

- The frontend is served by Nginx at `http://localhost` in this compose setup. For hot-reload development, run `npm run dev` inside `frontend/`.

---

## Docker & Production

We provide `docker-compose.prod.yml` to run a production-like stack where only Nginx is public:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
docker-compose -f docker-compose.prod.yml logs -f nginx backend
```

Important:

- `nginx/nginx.prod.conf` proxies `/api` to `backend:3000`.
- Use a secret manager for environment variables; do not store secrets in the repo.
- Terminate TLS at Nginx or your cloud load balancer; set `cookie.secure=true` for HTTPS in production.

---

## Environment Variables

Add these to `backend/.env` (example values; never commit secrets):

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `SESSION_SECRET` — session secret for express-session
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` — OAuth config
- `FRONTEND_URL` — frontend origin (CORS)
- `BASE_URL` — API base URL
- `PINECONE_API_KEY`, `MISTRAL_API_KEY` — RAG components
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` — Redis connection

Example snippet (do NOT use in prod):

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://app.yourdomain.com
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## Production Checklist

- Ensure `FRONTEND_URL`, `BASE_URL`, and `GOOGLE_CALLBACK_URL` point to production domains.
- Expose only Nginx publicly; keep backend, mongo, and redis internal.
- Use managed backups and monitoring for MongoDB and Redis.
- Verify `app.set('trust proxy', 1)` for correct cookie security behind a proxy.
- Consider autoscaling for backend workers and a managed load balancer for large traffic.

---

## Troubleshooting

- Frontend build errors in Docker: confirm Node 20 (we use `node:20-alpine`).
- Redis connect errors: verify `REDIS_*` env values and test with the Redis client.
- Rate limiter issues when scaling: confirm the Redis-backed limiter is active (`backend/src/middlewares/rateLimiters.js`).

---

## Developer Map (important files)

- Backend entry: [backend/src/app.js](backend/src/app.js)
- Redis config: [backend/src/config/redis.js](backend/src/config/redis.js)
- Rate limiters: [backend/src/middlewares/rateLimiters.js](backend/src/middlewares/rateLimiters.js)
- Auth routes: [backend/src/routes/auth.routes.js](backend/src/routes/auth.routes.js)
- Dockerfiles: [backend/Dockerfile](backend/Dockerfile) and [frontend/Dockerfile](frontend/Dockerfile)
- Compose (dev): [docker-compose.yml](docker-compose.yml)
- Compose (prod): [docker-compose.prod.yml](docker-compose.prod.yml)
- Nginx (dev): [nginx/nginx.conf](nginx/nginx.conf)
- Nginx (prod): [nginx/nginx.prod.conf](nginx/nginx.prod.conf)

---

## Next Steps

- Remove `version:` lines from compose files to silence warnings (I can do this for you).
- Add `deploy.md` with cloud-specific deployment steps.
- Harden TLS automation (certbot / Let's Encrypt) or integrate a managed LB.

If you'd like, I can proceed with any of the next steps above — tell me which one to do.
