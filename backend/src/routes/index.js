// budgets.js
const express = require('express');
const budgetRouter = express.Router();
const { getBudgets, createBudget, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
budgetRouter.use(protect);
budgetRouter.get('/', getBudgets);
budgetRouter.post('/', createBudget);
budgetRouter.put('/:id', updateBudget);
budgetRouter.delete('/:id', deleteBudget);

// accounts.js
const accountRouter = express.Router();
const { getAccounts, createAccount, deleteAccount } = require('../controllers/accountController');
accountRouter.use(protect);
accountRouter.get('/', getAccounts);
accountRouter.post('/', createAccount);
accountRouter.delete('/:id', deleteAccount);

// categories.js
const categoryRouter = express.Router();
const { getCategories, createCategory } = require('../controllers/accountController');
categoryRouter.use(protect);
categoryRouter.get('/', getCategories);
categoryRouter.post('/', createCategory);

// alerts.js
const alertRouter = express.Router();
const { getAlerts } = require('../controllers/accountController');
alertRouter.use(protect);
alertRouter.get('/', getAlerts);

// dashboard.js
const dashRouter = express.Router();
const { getSummary, getSpendingByCategory, getMonthlyTrend } = require('../controllers/dashboardController');
dashRouter.use(protect);
dashRouter.get('/summary', getSummary);
dashRouter.get('/spending-by-category', getSpendingByCategory);
dashRouter.get('/monthly-trend', getMonthlyTrend);

module.exports = { budgetRouter, accountRouter, categoryRouter, alertRouter, dashRouter };
