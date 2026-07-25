# Dev Deployment Documentation

## 1. Project Directory Structure

Project root: `/opt/dev`

```text
/opt/dev
├── docker-compose.dev.yml   # Docker services configuration
├── .env                     # Global environment variables
├── uploads/                 # Static files and uploaded images (host path)
├── backend/                 # Express / Node.js backend service
│   ├── src/
│   │   ├── config/env.js    # Port set to 5092
│   │   └── server.js        # Entry point (fallback port 5092)
│   └── Dockerfile
├── frontend/                # React / Vite frontend application
│   ├── package.json         # Dev/prod scripts targeting port 8001
│   └── Dockerfile           # ARG VITE_API_URL=http://144.79.218.126:5092
└── dashboard/               # React / Vite admin dashboard
    ├── package.json         # Scripts targeting port 8005
    └── Dockerfile           # ARG VITE_API_URL=http://144.79.218.126:5092
```

## 2. Service and Port Allocation

| Service | Container Name | Internal Port | Public Port | Purpose |
|--------|----------------|---------------|-------------|---------|
| Backend | `decantre-backend-dev` | 5092 | 0.0.0.0:5092 | Express API and static uploads handler |
| Frontend | `decantre-frontend-dev` | 8001 | 0.0.0.0:8001 | User client application |
| Dashboard | `decantre-dashboard-dev` | 8005 | 0.0.0.0:8005 | Admin dashboard |
| Database | `decantre-mongodb-dev` | 27017 | 0.0.0.0:27017 | MongoDB database engine |

## 3. Uploads and Storage Synchronization

- Physical location on VPS: `/opt/dev/uploads`
- Docker container location: `/app/uploads` inside the backend container
- Uploads are synchronized through Docker volume mapping so that any file saved by the backend is available directly on the host server.

This setup is useful for:
- storing uploaded images
- keeping files persistent across container restarts
- accessing files directly from the VPS filesystem

## 4. Static Asset and API Request Flow

```text
[Browser Client]
       │
       ├──► Frontend Page -> http://144.79.218.126:8001
       ├──► Admin Dashboard -> http://144.79.218.126:8005
       │
       ├──► API Requests -> http://144.79.218.126:5092/api/...
       └──► Image Assets -> http://144.79.218.126:5092/uploads/<image_name.jpg>
```

## 5. Key Commands

```bash
# Pull latest code from GitHub and reset to the remote master branch
cd /opt/dev && git fetch origin master && git reset --hard origin/master

# Rebuild and start containers from scratch
docker compose -f docker-compose.dev.yml build --no-cache && docker compose -f docker-compose.dev.yml up -d

# Check running containers
docker ps
```

## 6. Notes

- The backend service is expected to run on port `5092`.
- The frontend is configured to use the backend API on `http://144.79.218.126:5092`.
- The dashboard also uses the same backend API endpoint.
- Keep the `/opt/dev/uploads` directory writable so uploaded files can be stored correctly.
