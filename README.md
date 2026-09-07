# 🌿 SpendWise

> **"Understand your money. Control your spending."**

SpendWise is a modern, high-precision personal finance management dashboard built with React, TypeScript, Vite, and Tailwind CSS. Designed with a clean, pastel fintech aesthetic inspired by next-generation wealth management applications, SpendWise empowers users to track income and expenses, manage budgets, analyze spending velocity, monitor savings goals, and understand their overall financial health.

---

## ✨ Features

### 📊 1. Overview Dashboard
- **Greeting & Motivational Header**: Dynamic time-of-day greeting (*"Good morning/afternoon/evening, Ruks"*), current cycle subtitle, and ambient quote card (*"A better you starts with smarter choices."*).
- **4 Key Financial KPI Cards**:
  - **Total Balance**: ₹42,580 (`▲ 8.4% from last month`)
  - **Monthly Income**: ₹50,000 (`▲ 5.2% from last month`)
  - **Monthly Expenses**: ₹27,420 (`▼ 3.1% from last month`)
  - **Savings**: ₹22,580 (`▲ 12.6% from last month`)
- **Interactive Spending Overview Area Chart**:
  - Segmented toggle controls for **Income**, **Expense**, and **Savings**.
  - Flexible timeframe filtering: **This Month** (weekly W1–W4 trajectory), **3 Months**, **6 Months**, and **This Year**.
  - Custom branded tooltip with INR formatting and delta comparisons.
- **Spending by Category Donut Chart**:
  - Responsive Recharts donut visualization with center label (`₹27,420 Total Spent`).
  - Color-coded categories: Food, Shopping, Transport, Bills, Entertainment, Health, Other.
  - Formatted legend with live percentage share and text truncation containment.
- **Dynamic Financial Health Score Meter**:
  - Circular SVG progress gauge displaying `82 / 100` (*"Good"* tier).
  - Dynamic scoring algorithm:
    - Budget Adherence (30 pts)
    - Savings Rate (30 pts)
    - Expense Consistency (20 pts)
    - Savings Goal Milestones (20 pts)
  - Dynamic checklist rules evaluating budget limits, savings consistency, and category overspending.
- **Recent Transactions Widget**:
  - Clean mini-table showcasing merchant icons (Swiggy, Uber, Amazon, Electricity Bill, Salary) with semantic positive and negative color coding.
- **Budget Status Tracker**:
  - Overall monthly budget utilization (`₹27,420 / ₹35,000` — `78% used`).
  - Category budget progress bars with visual warning thresholds.
- **Smart Insights Engine**:
  - Real-time data-driven insights highlighting month-over-month increases, budget percentages, transport savings, and goal pace.
- **Savings Goals & Future Self Banner**:
  - Milestone cards for MacBook (`72%`), Emergency Fund (`70%`), and Travel (`62%`).
  - Motivational *"Invest in your future self — Discipline today, freedom tomorrow"* promo card.

---

### 💳 2. Transactions Management
- **Full-featured Data Table**: View, search, and manage all logged cashflow items.
- **Multi-dimensional Filtering**:
  - Live search across descriptions, notes, and merchants.
  - Type toggle: **All**, **Income**, **Expense**.
  - Category dropdown filter.
  - Sorting by Newest, Oldest, Highest Amount, or Lowest Amount.
- **Add & Edit Modal**:
  - Form validation: positive amounts, description, category selection, and transaction date.
  - Instant dashboard recalculation on submission.
- **Delete Confirmation Dialog**:
  - Safeguard modal verifying intent before permanently removing records.

---

### 🎯 3. Monthly Budgets
- **Dedicated Planner**: Set category thresholds and monitor actual consumption against allocated limits.
- **Overspend Alerts**: Color transitions from brand teal to amber (approaching limit) to rose (over budget).
- **Edit Budget Modal**: Quickly adjust monthly ceilings for any category.

---

### 📈 4. Financial Analytics & Deep Dive
- **Income vs Expenses Bar Chart**:
  - Multi-period analysis: **This Month** (weekly cashflow breakdown), **Last 3 Months**, **Last 6 Months**, and **This Year** (quarterly comparisons).
- **Performance Metrics**:
  - Average daily spending rate.
  - Highest single expense detection.
  - Live savings rate percentage benchmarked against the 20%+ target.
- **Top Spending Categories**: Ranked bar breakdown of expenditure drivers.
- **Key Takeaways**: Dynamic takeaways summarizing cashflow health, margin stability, and goal pace.

---

### 🚀 5. Savings Goals
- Track progress toward high-impact financial milestones.
- **Deposit Funds Modal**: Add contributions with quick presets (`+₹500`, `+₹1,000`, `+₹5,000`, `+₹10,000`).
- **Milestone Celebration**: Triggers celebratory confetti and unlocks the *"Goal completed"* badge upon reaching 100%.

---

### ⚙️ 6. Settings, Dark Mode & Local Persistence
- **Profile Customization**: Update name, email, and user avatar.
- **Currency Switcher**: Seamlessly switch between `₹ INR`, `$ USD`, `€ EUR`, and `£ GBP`.
- **Complete Dark Mode**: Handcrafted slate palette (`#0b1120`, `#141d2e`) with high-contrast text, borders, and readable charts.
- **Local Storage Reliability**: All transactions, budgets, goals, and user settings persist across browser sessions with zero server dependency.
- **Data Management**:
  - Export complete data backup in formatted JSON format.
  - Reset to initial demo reference state anytime.
  - Clear all local data with a confirmation modal.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom fintech design tokens
- **Data Visualization**: [Recharts](https://recharts.org/) (Responsive Area, Bar, and Donut charts)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation & Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ruksar-khatun/SpendWise.git
   cd SpendWise
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 📁 Project Architecture

```
SpendWise/
├── public/                 # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── analytics/      # AnalyticsPage & cashflow charts
│   │   ├── budgets/        # BudgetsPage & category budget cards
│   │   ├── common/         # Toast notifications & UI helpers
│   │   ├── help/           # Help & FAQ page
│   │   ├── layout/         # Header, Sidebar & Mobile Navigation
│   │   ├── modals/         # Transaction, Budget, Goal, and Delete modals
│   │   ├── overview/       # OverviewPage, StatCards, Charts & Widgets
│   │   ├── profile/        # User Profile view
│   │   ├── savings/        # SavingsGoalsPage & goal progress cards
│   │   └── settings/       # SettingsPage, preferences & data management
│   ├── context/
│   │   └── FinanceContext.tsx # Central reactive state & CRUD handlers
│   ├── types/
│   │   └── index.ts        # TypeScript data models & schemas
│   ├── utils/
│   │   ├── calculations.ts # Financial formulas, scoring & trend aggregation
│   │   ├── constants.ts    # Palette tokens & category definitions
│   │   ├── seedData.ts     # Reference seed data
│   │   └── storage.ts      # LocalStorage persistence wrapper
│   ├── App.tsx             # Root router & layout orchestrator
│   ├── index.css           # Tailwind base styles & fintech card design tokens
│   └── main.tsx            # Application entry point
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Custom theme, font & color extensions
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
