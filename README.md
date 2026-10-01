```markdown
# CreatorOS — All-in-One Creator Workspace

CreatorOS is a complete management platform built on the MERN stack (MongoDB, Express.js, React, Node.js) designed for digital creators, podcasters, and media entrepreneurs. Inspired by high-volume creators like Raj Shamani, CreatorOS streamlines content production, daily schedules, brand deal pipelines, and channel financial tracking into a single dashboard.

---

##  Features

#  Profile & Account Management
* Custom Creator Identity: Support for creator bios, niche settings, display names, and profile avatars.
* Multi-Platform Integration: Direct links for YouTube, Instagram, TikTok, and personal websites/blogs.
* Multi-Currency Support: Global currency toggling (e.g., INR ₹, USD $).

#  Content Production Board & Calendar
* kanban Workflow: Drag-and-drop or status-based pipeline tracking across **Idea**, **Scripting**, **Editing**, **Scheduled**, and **Published** stages.
* Multi-Platform Support: Categorize content by platform (YouTube, Instagram, TikTok, Blog, and custom channels).
* Interactive Calendar: Visual schedule view to plan upcoming upload dates and avoid bottlenecks.

#  Tasks & Daily Routine (Time Block Planner)
* Smart Task Allocation: Priority tags (High, Medium, Low) and direct linkage between tasks and specific content items.
* Time Blocking: Hourly time-block planner to structure daily deep work, filming, and strategic meetings.

#  Finance & Sponsorship Pipeline
* Financial Ledger: Income and expense ledger with automatic net profit calculations.
* Sponsorship CRM: Track brand deals across custom pipeline stages (**Lead**, **Negotiating**, **Contract Signed**, **Completed**, **Cancelled**) and payment statuses (Pending, Paid).

#  Analytics Dashboard
* High-level visual metrics on subscriber growth, revenue trends, and channel performance.

---

##  Project Structure

```text
MERN_PROJECT/
├── backend/
│   ├── config/             # Database and server configurations
│   ├── controllers/        # Route controllers / logic
│   ├── middleware/         # Auth and custom express middlewares
│   ├── models/             # Mongoose schemas (User, Content, Task, Finance, Deal)
│   ├── routes/             # Express API endpoints
│   ├── app.js              # Express application setup
│   ├── server.js           # Server entry point
│   ├── seedDemo.js         # Optional seed script for demonstration data
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── src/                # React application source code
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite build configuration
│   ├── .env.example        # Frontend environment variables template
│   └── package.json
│
├── .gitignore              # Root git ignore rules
├── package.json            # Root configuration for concurrent execution
└── README.md               # Project documentation

```

---

##  Tech Stack

* Frontend: React.js, Vite, CSS3 / Modern UI frameworks
* Backend: Node.js, Express.js
* Database: MongoDB & Mongoose ORM
* Process Management: `concurrently` (runs backend and frontend simultaneously)

---

##  Quick Start

# 1. Prerequisites

Ensure you have the following installed locally:

* [Node.js](https://nodejs.org/) (v18+ recommended)
* [npm](https://www.npmjs.com/)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URL)

# 2. Installation & Setup

Clone the repository to your local machine:

```bash
git clone [https://github.com/Mahikubavat/CreatorOS.git](https://github.com/Mahikubavat/CreatorOS.git)
cd CreatorOS

```

Install root, backend, and frontend dependencies:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..

```

# 3. Environment Variables

Create a `.env` file inside the `backend/` directory based on `backend/.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

```

# 4. Seed Demonstration Data (Optional)

To populate the app with pre-filled demo data (Raj Shamani profile, sample videos, tasks, and brand deals):

```bash
cd backend
node seedDemo.js
cd ..

```

# 5. Running the Application

From the root project directory, run both the backend and frontend simultaneously with a single command:

```bash
npm run dev

```

* Frontend App: `http://localhost:5173`
* Backend API: `http://localhost:5000`

---

```

```
