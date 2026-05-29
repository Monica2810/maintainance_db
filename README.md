# CampusFix

A full-stack maintenance request system for a university environment.

## Stack

- Frontend: React + Vite
- Backend: Express.js
- Database: PostgreSQL
- Features: authentication, CRUD, file uploads, role-based dashboards

## Setup

1. Create the PostgreSQL database and run `backend/schema.sql`.
2. Start the backend:

```bash
cd backend
npm install
npm start
```

3. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Update `frontend/.env` if your API is not running at `http://localhost:5000/api`.

## Notes

- Students can register and submit maintenance requests.
- Admin users can review all requests, update statuses, and delete records.
- Uploaded images are stored in `backend/uploads` and served from `/uploads`.

## Deployment (recommended)

Two convenient deployment options are below. For a simple, reliable demo, deploy the frontend to Vercel and the backend to Render (both have free tiers).

- Frontend (Vercel / Netlify):
	1. Push your repository to GitHub.
	2. Create a new project on Vercel and point it to the `frontend` directory.
	3. Set an environment variable in Vercel: `VITE_API_URL` = `https://your-backend.example.com/api` (replace with your backend URL).
	4. Vercel will build and publish the frontend; share the published URL.

- Backend (Render / Fly / Heroku):
	1. Create a new Web Service on Render and connect to the same GitHub repo.
	2. Set the service's build command to:

```bash
cd frontend && npm install && npm run build && cd ../backend && npm install
```

	3. Set the start command to:

```bash
cd backend && npm start
```

	4. Add the required environment variables in the Render dashboard: `DATABASE_URL`, `JWT_SECRET`, and any `DB_*` variables you use locally.
	5. Make sure `DATABASE_URL` points to your Neon database (you already have this value in `.env`).

Notes:
- The backend is configured to serve the built frontend if `frontend/dist` exists, so a single Render web service can host both frontend and backend.
- Uploaded files stored in `backend/uploads` are ephemeral on most hosting platforms — for production use, configure an S3-compatible bucket and update the upload logic.

Quick demo alternative: use `ngrok` to expose your local frontend/backend temporarily (good for in-class demos but not long-term).
