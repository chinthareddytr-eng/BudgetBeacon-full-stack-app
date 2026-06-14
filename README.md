# 💰 BudgetBeacon

**Full-stack personal finance platform** built with React, Node.js, PostgreSQL, JWT Auth, and Chart.js — featuring budget tracking, expense analytics, and savings goals.

🔗 **Live Demo:** [BudgetBeacon on GitHub Pages](https://chinthareddytr-eng.github.io/BudgetBeacon-full-stack-app)

---

## 📌 Overview

BudgetBeacon is a full-stack web application that helps users take control of their personal finances. It provides real-time expense tracking, interactive dashboards, budget monitoring, and savings goal management — all behind secure JWT-based authentication.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure user registration and login with token-based sessions
- 📊 **Interactive Dashboards** — Chart.js-powered visualizations for monthly and annual spending trends
- 💸 **Expense Tracking** — Log, categorize, and filter transactions in real time
- 🎯 **Savings Goals** — Set and monitor progress toward financial goals
- 🔔 **Automated Alerts** — Spending threshold alerts to prevent budget overruns
- 📁 **Receipt Storage** — Secure upload and storage of receipts via AWS S3
- 📅 **Financial Reports** — Generate monthly and annual reports from structured PostgreSQL data

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| Redux | Global state management |
| React Hooks | Local state & side effects |
| Chart.js | Data visualizations & dashboards |
| HTML / CSS | Styling and layout |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| PostgreSQL + Prisma | Relational database & ORM |
| JWT | Authentication & authorization |
| AWS S3 | Receipt and document storage |
| AWS API Gateway | Secure API routing |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v20+
- PostgreSQL
- AWS account (for S3 and API Gateway)

### Installation

```bash
# Clone the repository
git clone https://github.com/chinthareddytr-eng/BudgetBeacon-full-stack-app.git
cd BudgetBeacon-full-stack-app
```

### Backend Setup

```bash
cd backend
npm install

# Create a .env file with the following variables
cp .env.example .env
```

**.env variables:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/budgetbeacon
JWT_SECRET=your_jwt_secret_here
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=your_s3_bucket
PORT=5000
```

```bash
# Run Prisma migrations
npx prisma migrate dev

# Start the backend server
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`  
Backend runs at `http://localhost:5000`

---

## 📁 Project Structure

```
BudgetBeacon-full-stack-app/
├── backend/
│   ├── prisma/           # Prisma schema & migrations
│   ├── routes/           # Express API routes
│   ├── controllers/      # Business logic
│   ├── middleware/        # JWT auth middleware
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page views
│   │   ├── redux/        # Redux store & slices
│   │   └── App.js        # Root component
│   └── public/
└── README.md
```

---

## 🌐 Deployment

| Layer | Platform |
|---|---|
| Backend | Railway |
| Frontend | GitHub Pages |
| Database | PostgreSQL (Railway) |
| File Storage | AWS S3 |

---

## 📸 Screenshots

> _Dashboard and expense tracking screenshots coming soon._

---

## 🔮 Upcoming Features

- [ ] Mobile-responsive redesign
- [ ] Multi-currency support
- [ ] Export reports as PDF
- [ ] Recurring transaction automation
- [ ] OAuth (Google) login

---

## 👤 Author

**Tharun Reddy Chinthareddy**  
📧 chinthareddytr@gmail.com  
🔗 [linkedin.com/in/trch9](https://linkedin.com/in/trch9)  
💻 [github.com/chinthareddytr-eng](https://github.com/chinthareddytr-eng)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
