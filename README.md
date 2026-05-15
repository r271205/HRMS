# Nexus HR — Human Resource Management System

Full-stack HRMS with a **React (Vite) + Tailwind** frontend and **Node.js (Express) + MongoDB** backend. Designed as a portfolio-grade internship demo with JWT auth, role-based access, attendance, leave workflows, dashboards, and profile image uploads.

## Repository layout

| Folder     | Description                          |
| ---------- | ------------------------------------ |
| `backend/` | Express REST API, Mongoose models    |
| `frontend/`| React SPA, Context API, React Router |

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** 6+ (local or Atlas)

---

## Quick start (local)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run seed
npm run dev
```

API runs at **http://localhost:5000** (health: `GET /api/health`).

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Optional: set VITE_API_URL if not using the Vite proxy
npm install
npm run dev
```

App runs at **http://localhost:5173**. The Vite dev server proxies `/api` and `/uploads` to port **5000** when `VITE_API_URL` is empty.

---

## Demo credentials (after `npm run seed`)

| Role       | Email               | Password       |
| ---------- | ------------------- | -------------- |
| Owner admin| `rajan@gmail.com`   | `Rajan@123`    |
| Admin      | `admin@hrms.demo`   | `Admin@123`    |
| Employee   | `aisha@hrms.demo`   | `Employee@123` |

Override seed values in `backend/.env`: `SEED_OWNER_EMAIL`, `SEED_OWNER_PASSWORD`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_EMPLOYEE_PASSWORD`. Each seed run **resets** the owner admin password to `SEED_OWNER_PASSWORD` (default `Rajan@123`) so you can recover access during development.

---

## API routes

Base URL: `http://localhost:5000/api` (or your deployed API origin).

### Auth

| Method | Path           | Auth   | Description        |
| ------ | -------------- | ------ | ------------------ |
| POST   | `/auth/login`  | Public | JWT login          |
| GET    | `/auth/me`     | Bearer | Current user       |

### Employees (admin CRUD; employees see self)

| Method | Path               | Role   | Description        |
| ------ | ------------------ | ------ | ------------------ |
| GET    | `/employees`       | Both   | List (query: `search`, `department`, `status`, `page`, `limit`) |
| GET    | `/employees/:id` | Both   | Detail             |
| POST   | `/employees`       | Admin  | Create (+ user)    |
| PUT    | `/employees/:id`   | Admin  | Update             |
| DELETE | `/employees/:id`   | Admin  | Delete user+employee |

### Attendance

| Method | Path                          | Role      | Description              |
| ------ | ----------------------------- | --------- | ------------------------ |
| POST   | `/attendance/check-in`        | Employee  | Check-in today           |
| POST   | `/attendance/check-out`       | Employee  | Check-out today          |
| GET    | `/attendance/summary/today`   | Admin     | Today’s summary          |
| GET    | `/attendance`                 | Both      | List (`employeeId`, `from`, `to`, `page`, `limit`) |

### Leaves

| Method | Path                     | Role     | Description        |
| ------ | ------------------------ | -------- | ------------------ |
| POST   | `/leaves`                | Employee | Apply              |
| GET    | `/leaves`                | Both     | List + filters     |
| GET    | `/leaves/stats/summary`  | Admin    | Counts / pipeline  |
| PATCH  | `/leaves/:id/approve`    | Admin    | Approve            |
| PATCH  | `/leaves/:id/reject`     | Admin    | Reject             |

### Dashboard

| Method | Path                    | Role     | Description           |
| ------ | ----------------------- | -------- | --------------------- |
| GET    | `/dashboard/admin`      | Admin    | Analytics + activity  |
| GET    | `/dashboard/employee`   | Employee | Personal snapshot     |

### Profile

| Method | Path                | Auth   | Description                    |
| ------ | ------------------- | ------ | ------------------------------ |
| PATCH  | `/profile/avatar`   | Bearer | `multipart/form-data` field `image` |

---

## Deployment

### Frontend (Vercel)

1. Root directory: `frontend`
2. Build command: `npm run build`
3. Output: `dist`
4. Environment: `VITE_API_URL=https://your-api.onrender.com` (your public API URL, **no** trailing slash)

### Backend (Render)

1. Root directory: `backend`
2. Build: `npm install`
3. Start: `npm start`
4. Environment variables:

   - `MONGODB_URI` — Atlas connection string  
   - `JWT_SECRET` — long random string  
   - `CLIENT_URL` — your Vercel URL(s), comma-separated  
   - `NODE_ENV=production`  
   - `PORT` — Render sets automatically (use `process.env.PORT`)

5. **Persistent disk** (optional): mount a disk and set uploads path if you need profile images to survive restarts; otherwise default `uploads/` is ephemeral.

---

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Context API, Axios, React Hot Toast, Recharts, Framer Motion  
- **Backend:** Express, Mongoose, JWT, bcryptjs, Multer, CORS  
- **Database:** MongoDB  

---

## Security notes (production)

- Rotate `JWT_SECRET` and never commit `.env`.
- Use HTTPS everywhere.
- Tighten CORS to your exact frontend origin(s).
- Consider rate limiting and helmet for Express in production.

---

## License

MIT — use freely for learning and internship portfolios.
