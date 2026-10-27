# ACES KBTCOE — Official Departmental Student Club Website

Official full-stack web application for **ACES KBTCOE** (Computer Engineering Students' Association), Department of Computer Engineering, MVPS's KBT College of Engineering, Nashik.

---

## 🌟 Overview & Identity

- **Club Name:** ACES KBTCOE (Computer Engineering Students' Association)
- **Organization:** Departmental Student Club
- **Affiliation:** MVPS's KBT College of Engineering, Nashik
- **Department:** Department of Computer Engineering
- **Academic Term:** 2026 - 27
- **Motto & Core Pillars:** **Learn. Build. Connect. Lead.** ("Where Ideas Meet Innovation", "More than a committee")
- **Leadership:**
  - **President:** Aditya Dhikale
  - **Vice President:** Sammpana Kasar
  - **Treasurer:** Ayush Talekar
  - **Event Coordinators:** Khushi Mansuri & Yash Patil
  - **Committee Members:** Arjun Patil, Atharva Vispute, Apurva Rahane, Ronit Raheja, Purva Sonawane, Sarthak Patil, Sanyukti Gangurde, Mrunal Amrutkar, Mrunal Thete, Nirali Shah, Shraddha Sonar, Jiya Shah

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Routing:** React Router v7
- **Styling & Design System:** Tailwind CSS (Midnight Technical Theme: `#050b14`, `#07101e`, `#0b162c`, Electric Cyan `#38bdf8`, Electric Blue `#2563eb`)
- **Animation & Transitions:** Framer Motion (Page entrance, micro-interactions, modal springs) + Canvas particle constellation
- **Icons:** Lucide React

### Backend
- **Framework:** Node.js + Express + TypeScript
- **Database & ODM:** MongoDB with Mongoose (local daemon or MongoDB Atlas cloud cluster)
- **API Architecture:** Versioned REST API (`/api/v1`)
- **Validation:** Zod schemas for all request payloads
- **Authentication & Security:**
  - Password hashing with `bcryptjs`
  - HTTP-only JWT session cookies
  - Role-Based Access Control (`VISITOR`, `MEMBER`, `ADMIN`)
  - Concurrency-safe event capacity enforcement & duplicate prevention

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` (v22 tested and active)
- MongoDB instance (local `mongodb://localhost:27017` or cloud MongoDB Atlas URI)

### 2. Environment Configuration
Both `server/.env` and `server/.env.example` are pre-configured:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aces_kbtcoe
JWT_SECRET=aces_kbtcoe_secure_jwt_secret_key_2026_innovation
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=aces.kbtcoe@gmail.com
ADMIN_PASSWORD=AcesAdmin@2026
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Installation
Install all client and server dependencies:
```bash
npm run install:all
```

### 4. Running the Development Servers
In two terminal tabs:

**Terminal 1 — Backend API:**
```bash
npm run dev:server
# Or: cd server && npm run dev
```

**Terminal 2 — Frontend Application:**
```bash
npm run dev:client
# Or: cd client && npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Initial Administrator Access

The initial administrator is provisioned securely during database initialization:
- **Email:** `aces.kbtcoe@gmail.com`
- **Password:** `AcesAdmin@2026`
- **Admin Portal URL:** [http://localhost:5173/admin](http://localhost:5173/admin)

*(Auto-fill button is also available on the Login page for convenience during evaluation).*

---

## 🧪 Running Automated Tests

A comprehensive integration test suite verifies the entire application stack:
```bash
npm test
```

### Verified Test Suite Checks:
1. Health check `/health` returns status: healthy
2. `GET /api/v1/events` retrieves published events from MongoDB
3. `GET /api/v1/events/:slug` retrieves detailed event metadata
4. `GET /api/v1/team` returns verified committee members with official photographs
5. `GET /api/v1/activities` loads departmental activities and verified achievements
6. `POST /api/v1/contact` receives and validates student inquiries
7. `POST /api/v1/auth/register` provisions new student accounts with JWT tokens
8. `GET /api/v1/auth/me` retrieves private authenticated profiles
9. `POST /api/v1/applications` registers membership applications with status `PENDING`
10. Duplicate membership application prevention (`409 Conflict`)
11. `POST /api/v1/registrations` validates capacity and deadlines before confirming seats
12. Duplicate event registration prevention (`409 Conflict`)
13. Access control guard: Blocks non-admins from `/api/v1/admin/*` (`403 Forbidden`)
14. Admin authentication and token issuance (`ADMIN` role)
15. `GET /api/v1/admin/stats` pulls live database metrics and activity streams

---

## 📦 Production Build & Deployment

### Build Both Packages
```bash
npm run build
```

### Frontend Deployment (e.g., Vercel / Netlify)
1. Set Root Directory to `client`
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Environment Variable: Set `VITE_API_URL` to your production backend URL.

### Backend Deployment (e.g., Render / Railway / Fly.io)
1. Set Root Directory to `server`
2. Build Command: `npm run build`
3. Start Command: `npm run start`
4. Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A cryptographically secure random string
   - `CLIENT_URL`: Your production frontend domain (e.g. `https://aces-kbtcoe.vercel.app`)

---

## 📂 Project Architecture

```
ACES-Website/
├── client/                     # Vite + React 18 + TypeScript Frontend
│   ├── public/assets/          # Real ACES Logo, Team Photograph, & Member Photos
│   │   ├── aces-logo.jpeg      # Official ACES Club Logo
│   │   ├── aces-team.jpg       # Official 2026-27 Committee Photograph
│   │   └── members/            # Individual Committee Profile Pictures
│   ├── src/
│   │   ├── components/         # Modular UI & Layout Components
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   └── home/           # Hero, AboutSection, EventsPreview, TeamPreview, JoinCta
│   │   ├── context/            # AuthContext (JWT, user state, login/logout)
│   │   ├── pages/              # 12 Full-Featured Application Pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── EventsPage.tsx
│   │   │   ├── EventDetailPage.tsx
│   │   │   ├── TeamPage.tsx
│   │   │   ├── ActivitiesPage.tsx
│   │   │   ├── AchievementsPage.tsx
│   │   │   ├── GalleryPage.tsx
│   │   │   ├── JoinPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── MemberDashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── services/           # Fetch API Client & Versioned Endpoints
│   │   └── types/              # TypeScript Interfaces
│   ├── tailwind.config.js      # Midnight Technical Dark Theme Tokens
│   └── vite.config.ts          # Optimized Vendor & Animation Chunk Splitting
│
├── server/                     # Express + TypeScript + MongoDB Backend
│   ├── src/
│   │   ├── config/             # DB Connection & Resilience Fallbacks
│   │   ├── controllers/        # REST Route Handlers (Auth, Events, Registrations, etc.)
│   │   ├── middleware/         # Auth, Admin Guard, Zod Validators
│   │   ├── models/             # Mongoose Schemas (User, Event, Registration, etc.)
│   │   ├── routes/             # Versioned Routes (/api/v1/*)
│   │   ├── seed/               # Authentic 2026-27 Club Seed Data & Admin Provisioning
│   │   └── index.ts            # Server Entry Point & Health Check
│   └── test-api.js             # 15-Point Automated Integration Test Suite
│
└── package.json                # Unified workspace scripts
```
