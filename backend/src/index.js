require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const { budgetRouter, accountRouter, categoryRouter, alertRouter, dashRouter } = require('./routes/index');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'BudgetBeacon API running ✅', timestamp: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/dashboard', dashRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 BudgetBeacon API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
