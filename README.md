# UniFix Portal

A full-stack maintenance request system for a university environment.

## Submission Details

- GitHub repository: https://github.com/Monica2810/maintainance_db
- Live demo: https://maintenance-system-p6cb.onrender.com
- Demo admin login:
	- Email: admin@campusfix.local
	- Password: Admin123!

The live demo lets you open the app in a browser and test the full flow. The GitHub repository contains the source code, setup files, and deployment config.

## Stack

- Frontend: React + Vite
- Backend: Express.js
- Database: PostgreSQL
- Features: authentication, CRUD, file uploads, role-based dashboards

## Setup

1. Create the PostgreSQL database and run `backend/schema.sql`.
2. Install dependencies:

```bash
npm --prefix backend install
npm --prefix frontend install
```

3. Start the backend:

```bash
cd backend
npm install
npm start
```

4. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

5. Update `frontend/.env` if your API is not running at `http://localhost:5000/api`.

### Quick start from project root

If you are in the root folder and `npm start` fails, use these commands:

```bash
# backend only
npm start

# frontend only
npm run start:frontend

# backend + frontend together (after running `npm install` in root once)
npm run dev
```

`Live Server` is for static sites only and will not run this app because it needs a Node.js API and PostgreSQL connection.

