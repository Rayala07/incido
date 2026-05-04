# Incido - Smart Incident Response Platform

## Team Stack Breakers

Team Leader: Mannat Gupta  
Teammates: Rayala Viswanath, Srutidev Barman  

This project was built as part of Sheryians Startup Build Hackathon 2026, focusing on real world incident response workflows where speed, clarity, and coordination matter during downtime events.

**Pitch Video:** https://drive.google.com/file/d/1SuC_XcCFrWKd-egktF37PgoY-4EI7mEQ/view?usp=drive_link

---

**Access Frontend:** https://incido-green.vercel.app/

Incido is a DevOps and SRE productivity platform for managing production outages end to end. It enables teams to create incidents, assign responders, track timelines, generate AI powered postmortems, and extract action items to ensure permanent fixes and prevent recurring issues.

> Smart Incident Response Platform: A system for managing production outages and incidents with features like incident creation, responder assignment, timeline tracking, postmortems, live updates, and AI assisted insights.

## Admin Login

```
Email: developer.rayala@gmail.com
Password: Reyzox@123

## Responder Login

```
Login using google auth or login using email and password
use any email address to register for responder 
***Preffered Google Oauth***
```

## Quick Navigation

- [Team Stack Breakers](#team--stack-breakers)
- [Live Deployment (Vercel + Render)](#live-deployment-vercel--render)
- [Product Type](#product-type)
- [Key Features (Detailed)](#key-features-detailed)
- [Tech Stack](#tech-stack)
- [Technical Decisions (Why This Stack)](#technical-decisions-why-this-stack)
- [How AI Is Used in Incido](#how-ai-is-used-in-incido)
- [Admin vs Responder Login and Authorization](#admin-vs-responder-login-and-authorization)
- [Incident Creation, Leader and Member Assignment](#incident-creation-leader-and-member-assignment)
- [Security and Hardening](#security-and-hardening)
- [Deployment Notes](#deployment-notes)
- [Horizontal Scaling Setup (Step-by-Step)](#horizontal-scaling-setup-step-by-step)
- [How to See This Working](#how-to-see-this-working)
- [Quick Start](#quick-start)
- [Repository Structure](#repository-structure)
- [Contribution Guide](#contribution-guide)

---

## Live Deployment (Vercel + Render)

- **Frontend (Vercel):** https://incido-green.vercel.app/
- **Backend API (Render):** https://incido.onrender.com/

### Deployment Split

- **Vercel** is used for frontend hosting (React/Vite build + global CDN delivery).
- **Render** is used for backend API hosting (Node/Express runtime and API endpoints).

### Why this setup works well

- Fast static delivery for UI via Vercel.
- Simple managed backend runtime on Render.
- Clear separation of frontend and API deployments for independent updates.

---

## Product Type

- **Category:** B2B SaaS (DevOps / Incident Management)
- **Primary Users:** Engineering teams, incident commanders, on-call responders
- **Core Value:** Faster outage coordination, clearer communication, and AI-assisted incident learning

---

## Key Features (Detailed)

### 1) Incident Lifecycle Management

- Create incidents with title, description, severity, affected users/services, and visibility.
- Track incidents from active to resolved state.
- Keep ownership clear with creator, incident leader, and assigned members.

### 2) Responder Assignment and Access Control

- Assign responders by project membership.
- Enforce role-based permissions (admin, leader, responder).
- Prevent unauthorized updates/deletions by non-owners.

### 3) Timeline and Collaboration

- Maintain timeline entries for incident events and updates.
- Keep teams aligned with chronological context during active outages.

### 4) AI-Assisted Postmortem and Insights

- Generate structured postmortem content (what happened, why, fix, prevention).
- Suggest actionable follow-ups from incident context.

### 5) Similar Incident Retrieval (RAG-style)

- Search past incidents using embeddings and vector matching.
- Identify recurrence patterns and suggest reusable fixes from historical incidents.

### 6) Authentication and Session Experience

- Local auth (email/password) with password hashing.
- Google OAuth login flow for faster onboarding.
- JWT + cookie-based session handling for frontend authentication state.

### 7) Notifications

- Email verification flow for new registrations.
- Incident notification emails for assigned responders.

### 8) Public/Private Visibility

- Support public incident visibility for broad updates.
- Keep sensitive incidents private to authorized members.

---

## Tech Stack

| Layer            | Technology                                                      | Purpose                                                       |
| ---------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| Frontend         | React + Vite                                                    | SPA for dashboard, incidents, and projects                    |
| Backend API      | Node.js + Express                                               | Auth, incidents, timeline, projects, notifications            |
| Database         | MongoDB + Mongoose                                              | Persistent storage for users, projects, incidents             |
| Cache / Limiting | Redis (ioredis)                                                 | Distributed rate limiting and shared runtime state            |
| AI / RAG         | Gemini, Mistral, Pinecone, LangChain                            | Similar incident retrieval, summarization, insight generation |
| Auth             | JWT, Passport Google OAuth2, Cookies                            | Secure session + token-based authentication                   |
| Mail             | Nodemailer (OAuth2 Gmail SMTP)                                  | Verification emails and incident notifications                |
| Security         | Helmet, CORS, cookie policies                                   | HTTP hardening and safer browser interactions                 |
| Containerization | Docker, Docker Compose                                          | Local/prod container orchestration                            |
| Reverse Proxy    | Nginx                                                           | Serves frontend and proxies `/api` traffic                    |
| Cloud Deployment | Vercel + Render (live), Railway (supported), Render/VPS options | Managed deployment target                                     |

---

## Technical Decisions (Why This Stack)

- **Node.js + Express:** Lightweight API layer with fast development speed and easy middleware composition.
- **MongoDB:** Flexible schema model works well for evolving incident/postmortem data.
- **Redis:** Enables shared rate-limiting state across multiple backend instances.
- **Nginx reverse proxy:** Single public edge for routing, static serving, and safer traffic control.
- **Dockerized services:** Consistent local/prod behavior and easier deployment portability.
- **JWT + secure cookies:** Practical balance of stateless auth and browser security constraints.
- **Helmet + CORS policy:** Baseline HTTP hardening for production-ready APIs.

---

## How AI Is Used in Incido

AI is integrated in practical, operations-focused places:

- **Incident summarization:** Produces concise and structured summaries.
- **Postmortem generation:** Assists with RCA-style sections and prevention notes.
- **Similarity search:** Finds related historical incidents through vector retrieval.
- **Pattern detection:** Helps identify recurring failure themes and likely fix directions.

### Where AI Helps Most

- **During active incidents:** Gives responders a fast, readable summary so they do not lose time scanning long updates.
- **During triage:** Surfaces similar historical incidents and suggested resolution directions.
- **During closure:** Drafts structured postmortem sections to reduce manual documentation time.
- **During learning cycles:** Highlights recurring patterns so teams can prioritize preventive fixes.

### Why AI Is Useful for Teams and Companies

- **Faster MTTR:** Better context and quicker triage improve response speed.
- **Lower cognitive load:** On-call engineers spend less effort on repetitive writing/searching.
- **Knowledge reuse:** Incident learnings become discoverable instead of staying in scattered notes.
- **Higher postmortem quality:** Teams get consistent documentation even under pressure.
- **Better reliability culture:** Repeated issue patterns become visible, enabling long-term prevention.

This AI layer is a decision-support assistant, not an autopilot. Final ownership always remains with engineers and incident leaders.

---

## Admin vs Responder Login and Authorization

Incido uses role-aware login and authorization so every user gets the right access level.

### Login Paths

- **Local Login:** Email/password with hashed password verification.
- **Google OAuth Login:** Fast sign-in for team onboarding and invited users.

Both flows generate authenticated sessions and enforce role-based access in backend APIs.

### Authorization Model

- **Admin role:** Platform-level control for governance and cross-project operations.
- **Responder role:** Operational role focused on incident execution and collaboration.
- **Leader role (project/incident context):** A scoped responsibility inside teams for ownership actions.

### What Admins Are Authorized to Do

- Access all incidents and projects across the workspace.
- Create incidents even if they are not the current project leader.
- Assign members to incidents.
- Update and delete incidents where admin-level control is required.
- Perform broader operational visibility and oversight tasks.

### What Responders Are Authorized to Do

- Access incidents where they are involved, where visibility allows, or where project membership permits.
- Collaborate on timelines and incident progress updates.
- Work assigned incidents and contribute to resolution.
- Create/update incidents when they are authorized as leader/member in project context.

### Why This Is Needed for Companies

- **Operational safety:** Prevents accidental high-impact changes by limiting powerful actions.
- **Clear accountability:** Defines who can create, assign, update, and close critical incidents.
- **Audit readiness:** Role boundaries support compliance and internal governance reviews.
- **Scalable teamwork:** Large orgs can add many responders while keeping admin controls stable.
- **Faster incident response:** Teams focus on execution while admins maintain system-wide coordination.

---

## Incident Creation, Leader and Member Assignment

This is how ownership is assigned when an incident is created:

1. **Incident is created** with title, description, severity, project, and impact fields.
2. **Leader is determined** based on role context:
   - If a project leader exists, that leader can be set as incident leader.
   - Admins can create incidents and assign/override leadership as needed.
3. **Members/responders are assigned** from valid project members.
4. **Notifications are sent** to assigned users so response starts immediately.

### Why this assignment model is useful

- **Single point of accountability:** Leader owns coordination and closure.
- **Clear execution ownership:** Members know who is actively responding.
- **Faster coordination:** Automatic notifications reduce manual follow-up.
- **Safer operations:** Only authorized users can assign or modify incident membership.

### Expected outcome for teams

- Every incident has a clear owner.
- Response responsibilities are explicit from minute one.
- Postmortem and timeline quality improve because ownership is defined early.

---

## Security and Hardening

### Helmet

`Helmet` is enabled in the backend to add protective HTTP headers (for example CSP-related hardening, frame/transport/content protections). This reduces common browser-side attack risks and is important for production-grade API deployments.

### Auth and Cookies

- JWT is issued on login/OAuth callback.
- HTTP-only cookies are used for token transport.
- Cookie `secure` and `sameSite` options are environment-aware for production cross-site flows.

### Rate Limiting

- Redis-backed rate limiting helps protect API endpoints against abuse/spikes.

---

## Deployment Notes

### Render + Vercel (Current Live Setup)

- Frontend is deployed on Vercel: `https://incido-green.vercel.app/`
- Backend is deployed on Render: `https://incido.onrender.com/`
- Frontend calls backend APIs over HTTPS and uses CORS-safe configuration.
- Google OAuth callback and backend base URLs should point to the Render backend domain.

### Railway

- Railway deployment is supported using Docker-based setup.
- Configure all required backend environment variables in Railway dashboard.
- Keep secrets out of git and rotate exposed credentials immediately.

### Docker

- `docker-compose.yml` supports local multi-service development.
- `docker-compose.prod.yml` is for production-style topology.
- Backend, frontend, Redis, MongoDB, and proxy layers can run as isolated services.

### Nginx

- Nginx serves the frontend static build and forwards `/api` requests to backend.
- Config files are in `nginx/nginx.conf` and `nginx/nginx.prod.conf`.
- In production, expose Nginx publicly and keep backend/internal services private.

---

## Horizontal Scaling Setup (Step-by-Step)

Use this flow when traffic grows and you want multiple backend replicas.

1. **Keep backend stateless**
   - Store long-lived data in MongoDB.
   - Store shared runtime limits/state in Redis.
   - Do not keep request/session state in process memory.

2. **Run multiple backend instances**
   - Start 2+ backend containers/instances behind Nginx.
   - Ensure every instance has identical environment variables.

3. **Configure Nginx upstream/load balancing**
   - Add backend replicas as upstream targets.
   - Route `/api` through upstream so requests distribute automatically.

4. **Keep sticky assumptions minimal**
   - With JWT + cookies and shared Redis data, requests can be served by any replica.

5. **Add health checks and monitoring**
   - Use `/api/health` for liveness checks.
   - Monitor error rate, response time, and incident API latency.

6. **Scale gradually**
   - Start with 2 replicas, observe metrics, then scale up.

### Example (Docker Compose)

```bash
docker-compose up --build --scale backend=2
```

### Example (Railway)

- Increase backend service replicas in Railway service settings.
- Keep Nginx/proxy in front or use platform load-balancing with a single public entry.

---

## How to See This Working

Use these checks to verify the setup:

1. **Backend health**

```bash
curl http://localhost:3000/api/health
```

2. **Proxy path check via Nginx**

```bash
curl http://localhost/api/health
```

3. **Auth + email flow**
   - Register a new user and confirm verification email is sent.
   - Login with local auth and test Google OAuth callback flow.

4. **Incident flow**
   - Create an incident.
   - Assign responders.
   - Confirm assignment notification emails are sent.

5. **Scale behavior (basic)**
   - Run multiple backend replicas.
   - Send repeated requests and confirm no session breakage.
   - Ensure Redis-backed limiter and Mongo-backed data remain consistent across requests.

---

## Quick Start

1. Install dependencies for backend and frontend.
2. Set environment variables in `backend/.env`.
3. Run with Docker Compose or run backend/frontend separately.

Example:

```bash
docker-compose up --build
```

Health check:

```bash
curl http://localhost:3000/api/health
```

---

## Repository Structure

- `backend/` — Express API, auth, incidents, AI services, mail services
- `frontend/` — React UI, pages, hooks, API integration
- `nginx/` — reverse proxy and static serving configs
- `docker-compose.yml` / `docker-compose.prod.yml` — environment orchestration

---

## Contribution Guide

We welcome contributions.

1. Fork the repository.
2. Create a feature branch.
3. Commit clear, focused changes.
4. Test your changes locally.
5. Open a pull request with:
   - What changed
   - Why it changed
   - Screenshots/logs if relevant

### Suggested Branch Naming

- `feature/<name>`
- `fix/<name>`
- `docs/<name>`

---

**_We turn chaos into clarity._**