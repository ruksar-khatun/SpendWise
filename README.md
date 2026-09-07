# SpendWise 💳🌱
> *"Understand your money. Control your spending."*

SpendWise is a modern personal finance management dashboard engineered with a clean, high-density FinTech aesthetic. It empowers users to track income and expenses, plan category budgets, analyze spending trends with interactive charts, monitor savings goals with milestone celebrations, and evaluate overall financial health through a dynamic 100-point scoring algorithm.

---

## 🌟 Key Features

### 1. 📊 Overview Dashboard
- **Financial Summary Cards**: Four primary KPI cards (*Total Balance*, *Monthly Income*, *Monthly Expenses*, and *Savings*) with month-over-month deltas, circular badges, and quick-action menus.
- **Interactive Spending Overview**: Responsive Recharts area chart with smooth monotone curves, teal gradient fills, custom INR tooltips, metric toggles (*Income* | *Expense* | *Savings*), and multi-range selectors (*This Month* weekly view, *3 Months*, *6 Months*, *This Year*).
- **Dedicated "This Month" Weekly Breakdown**: Isolates the active billing cycle into weekly milestones (`W1 (1–7)`, `W2 (8–14)`, `W3 (15–21)`, `W4 (22–30)`) calculated from real-time transactions.
- **Spending by Category Donut**: Dynamic donut chart with center total spend indicator, responsive layout containment, and automatic breakdown legend.
- **Dynamic Financial Health Score**: Proprietary 100-point algorithm evaluating budget adherence (30 pts), savings rate (30 pts), expense consistency (20 pts), and goal progress (20 pts), featuring an interactive SVG ring gauge and actionable checklist rules.
- **Recent Transactions Ledger**: Visual ledger with merchant icons, semantic income/expense coloring, and quick link to the full ledger.
- **Budget Status**: Visual progress bar for overall monthly budget utilization alongside category breakdown meters.
- **Smart Insights**: Contextual observations based on actual user financial data.
- **Savings Goals**: Milestone tracking with progress bars, deposit shortcuts, and motivational banners.

### 2. 💳 Full Transactions Management
- Complete CRUD capabilities: Add, Edit, and Delete transactions with instant dashboard recalculations.
- Segmented type filters (*All*, *Income*, *Expense*), category filters, live keyword search, and multi-criteria sorting (newest, oldest, highest/lowest amount).
- Interactive modals with strict form validation and delete confirmation safeguards.

### 3. 🎯 Monthly Budgets
- Overall budget hero card comparing current burn against total limits.
- Category budget cards (*Food*, *Shopping*, *Transport*, *Bills*, *Entertainment*, *Health*, *Other*) with visual warning thresholds (80% approaching limit, 100%+ exceeded).
- "+ Set Budget" modal for instant monthly limit adjustments.

### 4. 📈 Financial Analytics
- Monthly Income vs Expenses bar chart with period comparisons.
- Weekly cashflow trajectory (*W1* through *W4*) for the active month.
- Key financial ratios: Daily spending average, highest single expense highlight, and 45%+ savings rate KPI.
- Ranked top spending categories and automated *"Key Takeaways"*.

### 5. 🏆 Savings Goals & Milestones
- Dedicated goal portfolio with customizable target dates, icons, and categories.
- Quick deposit modal with preset buttons (+₹500, +₹1,000, +₹5,000, +₹10,000).
- Celebratory confetti animation and *"Goal Completed"* badge upon reaching 100% target funding.

### 6. ⚙️ Settings, Dark Mode & Data Control
- User profile personalization (*Name*, *Email*, *Avatar*).
- Multi-currency support (₹ INR, $ USD, € EUR, £ GBP).
- High-contrast **Dark Mode** toggle persisted across sessions.
- Notification toggles for budget alerts, payment reminders, and weekly summaries.
- Data export to JSON file, demo data reset, and local storage wipe.

---

## 🎨 Design System & Color Palette

SpendWise follows a disciplined, soft pastel FinTech visual language:

| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas** | `#f4f7f6` | `#0b1120` | App background |
| **Cards** | `#ffffff` | `#141d2e` | Content cards & panels |
| **Brand Primary** | `#0d9488` / `#14b8a6` | `#2dd4bf` | Brand teal, active tabs, buttons |
| **Income / Success** | `#10b981` | `#34d399` | Income badges, positive trends |
| **Expense / Danger** | `#f43f5e` | `#fb7185` | Expense amounts, budget alerts |
| **Accents** | `#38bdf8`, `#6366f1`, `#f59e0b`, `#a855f7` | Category badges, charts |

---

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Charts**: [Recharts 3](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)

---

## 📦 Getting Started

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
   Open [http://localhost:5173](http://localhost:5173) in your browser to experience the dashboard.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```text
SpendWise/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── analytics/          # Financial Analytics page & deep-dive charts
│   │   ├── budgets/            # Budgets page & category limit meters
│   │   ├── common/             # Toast notification container, alerts
│   │   ├── help/               # Help & Support FAQ accordion
│   │   ├── layout/             # Sidebar, Header, MobileNav
│   │   ├── modals/             # Transaction, Budget, Goal, Deposit, Confirm modals
│   │   ├── overview/           # Overview KPI cards, Area chart, Donut, Health gauge
│   │   ├── profile/            # Profile summary card & tier status
│   │   ├── savings/            # Savings Goals portfolio & celebration
│   │   └── settings/           # Profile settings, dark mode, data export
│   ├── context/
│   │   └── FinanceContext.tsx  # Central React context & state management
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & data models
│   ├── utils/
│   │   ├── calculations.ts     # Health score algorithm, INR formatting, weekly filters
│   │   ├── constants.ts        # Category colors & design tokens
│   │   ├── seedData.ts         # Initial reference dataset
│   │   └── storage.ts          # Safe LocalStorage persistence utilities
│   ├── App.tsx                 # Main application shell & modal wiring
│   ├── index.css               # Tailwind directives & custom card styles
│   └── main.tsx                # React root entrypoint
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 Privacy & Persistence

SpendWise operates with **privacy-first architecture**. 100% of your financial data, custom budgets, transactions, and preferences remain local in your browser via `localStorage`. No external servers or cloud accounts are required to use the application. You can export a complete JSON snapshot of your data at any time from the Settings tab.

---

## 👤 Author

Developed with care by **[Ruksar Khatun](https://github.com/ruksar-khatun)**.
