# CreatorOS — full MERN app

## Run (React only, no backend needed)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 and register. Data is saved in your browser (localStorage).

## Run with the backend (Express + MongoDB)
Needs Node.js 18+ and MongoDB on localhost:27017 (or set `MONGO_URI` in `backend/.env`).

Terminal 1 - API (port 5000):
```bash
cd backend
npm install
npm start
```
Terminal 2 - React app: create `frontend/.env` containing
```
VITE_USE_BACKEND=true
```
then `npm run dev` in `frontend`.

## Features
Auth, profile + password change, content board/calendar (drag to schedule), tasks + filters + time blocking, income/expense ledger, monthly profit, sponsorship pipeline, analytics (finance, productivity, content).
