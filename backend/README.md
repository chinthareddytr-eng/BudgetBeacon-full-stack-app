# BudgetBeacon — Backend API

Node.js + Express + PostgreSQL (Prisma ORM) REST API for BudgetBeacon personal finance platform.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (jsonwebtoken + bcryptjs)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/transactions | Get all transactions (paginated) |
| POST | /api/transactions | Create transaction |
| PUT | /api/transactions/:id | Update transaction |
| DELETE | /api/transactions/:id | Delete transaction |
| GET | /api/budgets | Get all budgets |
| POST | /api/budgets | Create budget |
| GET | /api/accounts | Get all accounts |
| POST | /api/accounts | Create account |
| GET | /api/categories | Get categories |
| GET | /api/alerts | Get triggered alerts |
| GET | /api/dashboard/summary | Dashboard summary |
| GET | /api/dashboard/spending-by-category | Pie chart data |
| GET | /api/dashboard/monthly-trend | 6-month trend data |

## Setup Instructions (Windows)

### Prerequisites
- Node.js 18+ → https://nodejs.org
- PostgreSQL 15+ → https://www.postgresql.org/download/windows/

### 1. Clone and install
```bash
git clone https://github.com/chinthareddytr-eng/budgetbeacon.git
cd budgetbeacon/backend
npm install
```

### 2. Setup environment
```bash
copy .env.example .env
```
Edit `.env` and set your PostgreSQL credentials:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/budgetbeacon"
JWT_SECRET="any_long_random_string_here"
```

### 3. Create database
Open pgAdmin or psql and run:
```sql
CREATE DATABASE budgetbeacon;
```

### 4. Run Prisma migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the server
```bash
npm run dev
```

API will be live at: http://localhost:5000
Health check: http://localhost:5000/health

## Project Structure
```
backend/
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── config/
│   │   ├── db.js            # Prisma client
│   │   └── jwt.js           # JWT helpers
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── budgetController.js
│   │   ├── accountController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   └── index.js
│   └── index.js             # Express app entry point
├── .env.example
└── package.json
```
