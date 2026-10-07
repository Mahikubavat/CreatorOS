# CreatorOS

CreatorOS is a full-stack productivity and business dashboard built for creators, influencers, and digital entrepreneurs. It helps manage content planning, production workflows, finances, sponsorship deals, and performance analytics in one place.

## Tech stack
- Frontend: React + Vite
- Routing: React Router
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt
- Data storage mode: browser localStorage or MongoDB-backed API

## Features
- User authentication and profile management
- Password updates and personal creator profile settings
- Content planning board for ideas, stages, platforms, and publishing workflow
- Task tracking with priorities, statuses, filters, and due dates
- Time-blocking calendar for scheduling work
- Income and expense ledger with categories and totals
- Sponsorship and brand deal pipeline management
- Dashboard analytics for finance, productivity, and content performance

## Project structure
```text
.
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   ├── seedDemo.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
├── package.json
├── README.md
└── .gitignore
```

## Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://127.0.0.1:27017` (for backend mode)
- Optional: npm package manager

## Quick start

### 1) Install dependencies
From the project root:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2) Start the app
#### Option A: Run both frontend and backend together
From the root:
```bash
npm run dev
```
This uses the root `concurrently` script to start the frontend and backend together.

#### Option B: Start them manually
Terminal 1 — backend:
```bash
cd backend
npm run dev
```
Terminal 2 — frontend:
```bash
cd frontend
npm run dev
```

## Backend configuration
Create a `backend/.env` file if you want to override defaults:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/creatorOS
```
The backend will run on `http://localhost:5000` by default.

## Frontend configuration
The frontend supports two modes:

### Browser-only mode (default)
No extra setup is required. The app stores data in `localStorage` and does not need MongoDB.

Open:
```text
http://localhost:5173
```

### API mode with MongoDB backend
Create a `frontend/.env` file:
```env
VITE_USE_BACKEND=true
```
Then start the frontend. The app will call the Express API at `http://localhost:5000/api`.

## Default development URLs
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Common commands
```bash
# Root
npm run dev

# Backend only
cd backend
npm start
npm run dev

# Frontend only
cd frontend
npm run dev
npm run build
```

## Notes
- The project is designed as a creator operating system for planning, execution, and monetization.
- In local mode, data persists in the browser only.
- In backend mode, data is persisted in MongoDB and shared across app sessions.
