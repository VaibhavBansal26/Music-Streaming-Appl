# Music Streaming Application

A microservice-based music streaming app: a React frontend plus three Node/TypeScript services, containerised with Docker and deployed to AWS EKS through a Jenkins pipeline.

## Architecture

| Service | Port | Responsibility | Storage |
|---|---|---|---|
| `userService` | 5001 | Register / login (JWT), profile, playlist toggle | MongoDB |
| `songService` | 5003 | Read-only albums and songs, Redis-cached | PostgreSQL (Neon), Redis |
| `adminService` | 5002 | Admin-only album/song upload and delete, cache invalidation | PostgreSQL (Neon), Redis, Cloudinary |
| `frontend` | 80 | React + Vite + Tailwind SPA served by nginx | none |

`adminService` authenticates requests by calling `userService` `GET /api/v1/user/getUserProfile` with the caller's `token` header.

**Tech stack:** React, TypeScript, Tailwind, Node.js/Express, MongoDB, PostgreSQL, Redis, Cloudinary, JWT, Docker / Docker Compose, Kubernetes (AWS EKS), Jenkins, SonarQube, Trivy, OWASP Dependency-Check.

## Demo


![1](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290088/Screenshot_2025-03-29_at_6.14.21_PM_v0nh0i.png)

![2](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290090/Screenshot_2025-03-29_at_6.14.39_PM_ahwaub.png)

![3](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290091/Screenshot_2025-03-29_at_7.10.24_PM_mfs6kv.png)

![4](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290092/Screenshot_2025-03-29_at_7.12.28_PM_bz8gx6.png)

![5](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290093/Screenshot_2025-03-29_at_7.12.50_PM_dbpmy0.png)

![5.1](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290093/Screenshot_2025-03-29_at_7.13.02_PM_whq3fv.png)

![6](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290093/Screenshot_2025-03-29_at_7.09.58_PM_hskt1t.png)

![7](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290091/Screenshot_2025-03-29_at_7.09.31_PM_idx586.png)

![8](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290091/Screenshot_2025-03-29_at_7.09.12_PM_pmqtxr.png)

![9](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290091/Screenshot_2025-03-29_at_7.11.09_PM_iarmeq.png)

![10](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290089/Screenshot_2025-03-29_at_7.08.34_PM_p7rgg5.png)

![11](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290089/Screenshot_2025-03-29_at_7.09.03_PM_txalkk.png)

![12](https://res.cloudinary.com/vaibhav-codexpress/image/upload/v1743290088/Screenshot_2025-03-29_at_7.08.01_PM_ybpbik.png)

## Configuration

Each service reads a local `.env` (git-ignored). Copy the `.env.example` in each folder and fill it in. Never commit real values.

Admin accounts are no longer self-assigned: a user gets the `admin` role only if their email is listed in `ADMIN_EMAILS` when they register.

`userService/.env`
```
PORT=5001
MONGO_URI=<mongodb connection string>
DB_NAME=music_stream
JWT_SECRET=<long random string, e.g. openssl rand -hex 32>
ADMIN_EMAILS=<comma-separated emails that become admins when they register>
CORS_ORIGIN=<comma-separated allowed origins; empty = any>
```

`songService/.env`
```
PORT=5003
DB_URL=<neon postgres url>
REDIS_HOST=<host>
REDIS_PORT=<port>
REDIS_PASSWORD=<password>
```

`adminService/.env`
```
PORT=5002
DB_URL=<neon postgres url>
User_URL=http://localhost:5001
CLOUD_NAME=<cloudinary cloud name>
CLOUD_API_KEY=<key>
CLOUD_API_SECRET=<secret>
REDIS_HOST=<host>
REDIS_PORT=<port>
REDIS_PASSWORD=<password>
```

`frontend/.env` (the frontend builds each URL as `${URL}:${PORT}`; leave the port empty when the URL is a load balancer on port 80)
```
VITE_API_USER_URL=http://localhost
VITE_API_SONG_URL=http://localhost
VITE_API_ADMIN_URL=http://localhost
VITE_API_USER_PORT=5001
VITE_API_SONG_PORT=5003
VITE_API_ADMIN_PORT=5002
```

## Run locally

```bash
# in each of userService, songService, adminService
npm install
npm run dev        # tsc -w + nodemon

# frontend
cd frontend && npm install && npm run dev
```

Production build of a service: `npm run build && npm start`. If a port is stuck: `lsof -i :5001` then `kill -9 <pid>`.

## Docker

```bash
docker compose up -d --build
docker compose logs -f user-service
docker compose down -v
```

Compose publishes ports 5001, 5002, 5003 and 80. Image tags default to `latest`; set `TAG=<build>` to override. Each service has a `/health` endpoint.

## CI/CD and Kubernetes

`Jenkinsfile` stages: checkout, SonarQube analysis, quality gate, frontend install, `docker-compose build && push`, `kubectl apply` of `Kubernetes/` to the EKS cluster, rolling restart. Required Jenkins credentials: `docker-cred`, `aws-creds`, and secret-file credentials `admin-env`, `song-env`, `user-env` and `frontend-env` (the contents of each service's `.env`). The pipeline builds images tagged with the build number, creates the Kubernetes Secrets from those files, waits for each rollout, and no longer prints secrets or prunes the agent. Helper scripts for tool installation live in `executables/`.

## Status of review findings

Fixed in code (numbers refer to the review list):

| # | Fix |
|---|---|
| 2 | Jenkins no longer prints `.env` files; env comes from secret-file credentials |
| 3, 4 | `role` ignored at registration (use `ADMIN_EMAILS`); responses return a public user object without the hash |
| 5 | Input validation, login/register rate limit, `helmet`, configurable CORS, upload size and MIME limits, JSON body limit |
| 7, 8 | `userService` honours `PORT`; cache TTL 300s; admin writes invalidate `album_song_<id>` |
| 9 | 401 for missing/invalid token, 403 for non-admin, everywhere |
| 10, 11, 12 | Admin input validated before upload; thumbnails go to `thumbnails/`; Cloudinary assets deleted with their rows; album delete is one statement via `ON DELETE CASCADE` |
| 13 | Startup logs after success, exit on DB failure, Redis is optional, `/health` endpoints |
| 16-19 | Multi-stage Dockerfiles with `npm ci`, non-root, prod-only deps; compose cleaned; Jenkinsfile cleaned, blocking quality gate, Trivy scan, image tags per build; Kubernetes manifests rewritten with Secrets, probes and resource limits |
| 20 | Typos, unused imports and console logs removed; duplicate commented-out pipelines deleted |
| UI | New design system, responsive layout, new player with time and volume, shared song table, auth pages, admin dashboard (its two forms no longer share state) |

Still open:

- **Rotate every leaked credential and purge git history (issue 1).** Removing the files from the working tree does not remove them from history.
- Existing databases keep the old `albums`/`songs` foreign key (`ON DELETE SET NULL`); run `ALTER TABLE songs DROP CONSTRAINT songs_album_id_fkey, ADD CONSTRAINT songs_album_id_fkey FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE;` once. Until then deleting an album orphans its songs instead of removing them.
- The JWT is still stored in `localStorage` (issue 15); the backends accept `Authorization: Bearer` but the frontend still sends the `token` header.
- Admin auth still calls `userService` per request (issue 6), and the playlist route name is unchanged (issue 14).
- No automated tests.
