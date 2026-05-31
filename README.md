# Rogāre — Internship FAQ Platform

A full-stack Q&A platform for lab interns at IIT Ropar, built with React + Vite (frontend) and Node.js + Express + MongoDB (backend). Supports role-based access (user / admin), FAQ browsing, search, and a spark-based engagement system.

**Stack:** React 19, Tailwind CSS v4, Inter + Playfair Display, Node.js, Express 5, Mongoose, Argon2, JWT (httpOnly cookie)

**Run locally:** start the backend (`npm run dev` in `/backend`) then the frontend (`npm run dev` in `/frontend`), and set `VITE_API_BASE_URL` in a `.env` file pointing to the backend.

## Environment Setup

Both backend and frontend need `.env` files before running. Copy the examples and fill in your values:

### Backend — `backend/.env`

```bash
cp backend/.env.example backend/.env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server runs on (default: `5000`) |
| `MONGODB_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret string for signing JWTs (min. 32 chars) |
| `ALLOWED_ORIGINS` | comma-separated list of allowed CORS origins (e.g. `http://localhost:5173,http://localhost:3000`) |
| `NODE_ENV` | `development` or `production` |

### Frontend — `frontend/.env`

```bash
cp frontend/.env.example frontend/.env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend URL (e.g. `http://localhost:5000`) |
| `VITE_APP_NAME` | App display name (e.g. `Rogāre`) |

## Contributors

| # | Name | Role |
|---|------|------|
| 1 | Contributor Name | Samyabrata Roy |
| 2 | Contributor Name | Nandini |
| 3 | Contributor Name | SAMAD MOHAMMED |
| 4 | Contributor Name | Ansh Varshney |
| 5 | Contributor Name | Kashish Panwar |
| 6 | Contributor Name | Shreya Choudhary |
| 7 | Contributor Name | Rahul Prasad |
| 8 | Contributor Name | Abhi Sriya |
| 9 | Contributor Name | Adhin Mahesh |
| 10 | Contributor Name | Udarsh Goyal |

---

© VLED Lab, IIT Ropar. All rights reserved. This software was developed by VINS Interns using Vicharanashala Lab's resources during the internship period.
