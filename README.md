# 🌿 SpendWise — Full-Stack Personal Finance & Wealth Platform

> **"Understand your money. Control your spending."**

SpendWise is a production-grade **Full-Stack FinTech platform** featuring a modern **React 19 + TypeScript** dashboard, a robust **Node.js + Express + TypeScript** REST API, and a relational database powered by **Prisma ORM**.

Designed with a clean, pastel fintech aesthetic, SpendWise empowers users to track cash flow, manage dynamic category budgets, visualize time-series spending velocity, hit savings milestones, and calculate real-time algorithmic **Financial Health Scores**.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 SpendWise React Frontend                    │
│   (Vite + React 19 + TypeScript + Recharts + Tailwind CSS)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (JSON) + Bearer JWT
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              SpendWise Express API Server                   │
│   ├── JWT Auth Middleware & bcrypt password encryption      │
│   ├── Controllers (Auth, Transactions, Budgets, Goals)      │
│   ├── Zod Schema Validation & Error Handling Middleware     │
│   └── Prisma Client (Type-safe DB Access)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQL Queries via Prisma
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Relational Database (Prisma ORM)              │
│   • Dev: SQLite (Zero-config, instant local startup)        │
│   • Prod: PostgreSQL (Neon / Supabase / Railway ready)      │
│   [Users, Transactions, Budgets, SavingsGoals, Settings]    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Highlights & Full-Stack Capabilities

- **End-to-End Type Safety**: Shared TypeScript domain models across client and server.
- **Enterprise Security**:
  - Stateless JWT token authorization (`Authorization: Bearer <token>`).
  - Password encryption with `bcryptjs` (10 salt rounds).
  - Strict input validation using `Zod` schemas.
- **Relational Data Modeling**:
  - Normalized database schema with foreign key cascades (`User` ➔ `Transactions`, `Budgets`, `SavingsGoals`).
  - Composite indexes and unique constraints on `[userId, date]` and `[userId, category, month]`.
- **Google Account Authentication & Cloud Database Sync**:
  - Sign in or sign up via Google account to securely persist all transactions, category budgets, and savings milestones directly to your SQLite database.
  - Generates signed JWT session tokens and syncs client state with the backend automatically.
- **Hybrid Offline Resilience**:
  - Seamless frontend API client (`src/services/api.ts`) that persists to the Express/SQL database when online.
  - Automatically falls back to browser `localStorage` when offline, guaranteeing 100% uptime with zero blank screens.
- **Server-Side Algorithmic Scoring**:
  - Dynamic 100-point Financial Health score computed server-side across budget adherence, savings rate, consistency, and goal velocity.

---

## ✨ Features

### 📊 1. Overview Dashboard
- **4 Key Financial KPI Cards**:
  - **Total Balance**: ₹42,580 (`▲ 8.4% from last month`)
  - **Monthly Income**: ₹50,000 (`▲ 5.2% from last month`)
  - **Monthly Expenses**: ₹27,420 (`▼ 3.1% from last month`)
  - **Savings**: ₹22,580 (`▲ 12.6% from last month`)
- **Interactive Spending Overview Area Chart**:
  - Segmented toggle controls for **Income**, **Expense**, and **Savings**.
  - Timeframe filtering: **This Month** (weekly trajectory), **3 Months**, **6 Months**, and **This Year**.
- **Spending by Category Donut Chart**:
  - Responsive Recharts donut visualization with center label (`₹27,420 Total Spent`).
  - Color-coded categories: Food, Shopping, Transport, Bills, Entertainment, Health, Other.
- **Dynamic Financial Health Score Meter**:
  - Circular SVG progress gauge displaying `82 / 100` (*"Good"* tier).
  - Algorithmic evaluation: Budget Adherence (30 pts), Savings Rate (30 pts), Expense Consistency (20 pts), and Goal Velocity (20 pts).
- **Recent Transactions Widget**:
  - Mini-table with merchant brand icons and categorized rows.
- **Budget Status Tracker**:
  - Overall monthly budget utilization (`78% used`) and category progress bars.
- **Savings Goals & Future Self Banner**:
  - Milestone cards for MacBook (`72%`), Emergency Fund (`70%`), and Travel (`62%`).

### 💳 2. Transactions Management
- Full CRUD operations with instant optimistic UI and server synchronization.
- Filter by Type (All, Income, Expense), Category, and Date range.
- Search bar across descriptions, notes, and merchants.
- Safe delete confirmation safeguard.

### 🎯 3. Monthly Budgets
- Set and adjust category spending ceilings.
- Visual warning thresholds (Normal ➔ Approaching limit ➔ Over-budget alert).

### 📈 4. Financial Analytics & Deep Dive
- Multi-period Cash Flow Bar Charts (**This Month** `W1`–`W4`, 3-month, 6-month, quarterly).
- Daily average spending, highest expense card, savings rate, and key takeaways.

### 🚀 5. Savings Goals & Celebration
- Define target dates and milestone goals.
- Incremental deposits with confetti celebration upon reaching 100%.

### ⚙️ 6. Settings & Customization
- Profile management with neutral vector avatar.
- Multi-currency support (`₹ INR`, `$ USD`, `€ EUR`, `£ GBP`).
- Dark mode toggle with persisted preference.
- One-click JSON data backup and export.

---

## 📡 RESTful API Reference

All protected endpoints require `Authorization: Bearer <jwt_token>`.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & service status | Public |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login with email & password | Public |
| `GET` | `/api/auth/me` | Fetch active user profile | Required |
| `GET` | `/api/transactions` | List transactions (supports `?month=`, `?category=`) | Required |
| `POST` | `/api/transactions` | Create new transaction | Required |
| `PUT` | `/api/transactions/:id` | Update transaction by ID | Required |
| `DELETE` | `/api/transactions/:id`| Delete transaction by ID | Required |
| `GET` | `/api/budgets` | Fetch budgets for a month (`?month=2026-09`) | Required |
| `POST` | `/api/budgets` | Upsert budget limit for category | Required |
| `DELETE` | `/api/budgets/:id` | Remove budget category | Required |
| `GET` | `/api/goals` | Retrieve all savings goals | Required |
| `POST` | `/api/goals` | Create new savings goal | Required |
| `POST` | `/api/goals/:id/deposit` | Deposit money to savings goal | Required |
| `GET` | `/api/analytics/summary` | Aggregated monthly cash flow & category breakdown | Required |
| `GET` | `/api/analytics/health-score` | Server-calculated 100-point Health Score & checklist | Required |
| `GET` | `/api/settings` | Get user preferences & notification settings | Required |
| `PUT` | `/api/settings` | Update user preferences | Required |

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express, TypeScript, Zod, JWT (`jsonwebtoken`), `bcryptjs`, CORS |
| **Database & ORM** | Prisma ORM, SQLite (local development), PostgreSQL-ready |
| **Tooling** | Concurrently, tsx, Git, GitHub |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or v20+ recommended)
- **npm** (comes with Node.js)

### Quick Start (Single Command)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ruksar-khatun/SpendWise.git
   cd SpendWise
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   npm --prefix server install
   ```

3. **Initialize and seed the database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```
   *Seeds the default demo account (`ruks@example.com` / `password123`) with full September 2026 transactions, budgets, and goals.*

4. **Run both Frontend and Backend concurrently**:
   ```bash
   npm run dev
   ```
   - **Frontend**: [http://localhost:5173/](http://localhost:5173/)
   - **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 💼 Resume & Interview Talking Points (Fresher Full-Stack)

### Resume Bullet Points:
```markdown
SpendWise — Full-Stack Personal Finance & Wealth Management Platform
Tech Stack: React 19, TypeScript, Node.js, Express, Prisma ORM, SQLite/PostgreSQL, Tailwind CSS, Recharts
• Architected a responsive full-stack financial dashboard featuring interactive time-series visualizations, category allocations, and budget progress tracking.
• Engineered a secure RESTful API in Node.js/Express with JWT stateless authentication, bcrypt password encryption, and Zod input validation.
• Designed and indexed a normalized relational database schema using Prisma ORM with cascading foreign-key relations across Users, Transactions, and Goals.
• Developed a dynamic 100-point Financial Health scoring algorithm evaluating budget adherence, savings rate velocity, and expense consistency.
• Implemented an offline-first resilient API client in React Context with seamless fallback to localStorage, ensuring zero downtime and 100% availability.
```

### Key Technical Interview Q&A:
1. **"How is authentication handled?"**
   Stateless JSON Web Tokens (JWT) signed with a server secret. Passwords are salted and hashed with `bcryptjs` (10 rounds). Protected Express routes use an `authenticateToken` middleware that verifies the Bearer token and attaches the authenticated user to the request.
2. **"How does the database handle scalability?"**
   Prisma ORM abstracts database queries with typed client operations. Foreign key relations cascade on user deletion, and composite indexes on `[userId, date]` optimize transaction queries over large datasets. Zero-config SQLite is used for instant local development and can be swapped to PostgreSQL on Neon/Supabase simply by updating `DATABASE_URL`.
3. **"How does the frontend handle backend failures?"**
   The frontend implements an optimistic update pattern with dual-layer persistence: it applies state updates immediately, writes to local cache, and syncs asynchronously to the API. If the server is offline, it continues functioning seamlessly in Local Mode.

---

## 📁 Repository Structure

```
SpendWise/
├── public/                 # Static assets & neutral vector avatar
├── server/                 # Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma   # Relational database schema
│   │   └── seed.ts         # Database seed script
│   └── src/
│       ├── controllers/    # Route controllers (Auth, Tx, Budget, Goals, Analytics)
│       ├── middleware/     # JWT Auth & centralized error handling
│       ├── routes/         # Express REST API routes
│       ├── prisma.ts       # Prisma Client singleton
│       └── index.ts        # Server entry point & CORS configuration
├── src/                    # React Frontend
│   ├── components/         # Modular UI components & charts
│   ├── context/            # FinanceContext with API sync & offline fallback
│   ├── services/           # Full-stack API client
│   ├── types/              # Domain interfaces & TypeScript types
│   └── utils/              # Financial algorithms & health scoring
├── package.json            # Root scripts (dev, build, db:push, db:seed)
└── README.md               # Documentation & interview guide
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
