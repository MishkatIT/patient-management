# Patient Management

A Django REST Framework and React patient management application.

## Repository layout

- `backend/`: Django, DRF, PostgreSQL API, authentication, visits, and seed script.
- `frontend/`: Vite React interface for patient CRUD and pagination.

## Run everything

1. Follow [backend/README.md](backend/README.md) to configure PostgreSQL and start the API.
2. Follow [frontend/README.md](frontend/README.md) to install and start the React app.
3. Open `http://localhost:5173`.

## Deploy to Render

This repository includes a Render Blueprint in [`render.yaml`](render.yaml). In Render, choose **New > Blueprint**, connect the GitHub repository, and apply the blueprint. It creates a managed PostgreSQL database, a Django API, and a Vite static site.

The blueprint supplies the database URL, production secret, allowed hosts, and frontend API URL. The backend runs migrations and collects static files during startup. After deployment, update `CORS_ALLOWED_ORIGINS` on the API if Render assigns a different frontend hostname.

Do not put account passwords or API tokens in the repository. Authenticate to Render through its dashboard or CLI login flow.
