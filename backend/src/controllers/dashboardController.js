const prisma = require('../config/db');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [accounts, monthlyIncome, monthlyExpenses, budgets, recentTxns] = await Promise.all([
      // All accounts with total balance
      prisma.account.findMany({ where: { userId } }),

      // Monthly income
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),

      // Monthly expenses
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),

      // Active budgets
      prisma.budget.findMany({
        where: { userId, startDate: { lte: now }, endDate: { gte: now } },
        include: { category: true },
      }),

      // Recent 5 transactions
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true, account: true },
        orderBy: { date: 'desc' },
        take: 5,
      }),
    ]);

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const income = monthlyIncome._sum.amount || 0;
    const expenses = monthlyExpenses._sum.amount || 0;

    res.json({
      totalBalance,
      monthlyIncome: income,
      monthlyExpenses: expenses,
      monthlySavings: income - expenses,
      accounts,
      budgets,
      recentTransactions: recentTxns,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching summary' });
  }
};

// @desc    Get spending by category (for pie chart)
// @route   GET /api/dashboard/spending-by-category
const getSpendingByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const data = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId: req.user.id, type: 'EXPENSE', date: { gte: start, lte: end }, categoryId: { not: null } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    const categories = await prisma.category.findMany({
      where: { id: { in: data.map((d) => d.categoryId).filter(Boolean) } },
    });

    const result = data.map((d) => {
      const cat = categories.find((c) => c.id === d.categoryId);
      return { category: cat?.name || 'Uncategorized', amount: d._sum.amount, color: cat?.color, icon: cat?.icon };
    });

    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get monthly trend (income vs expense for last 6 months)
// @route   GET /api/dashboard/monthly-trend
const getMonthlyTrend = async (req, res) => {
  try {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = start.toLocaleString('default', { month: 'short', year: '2-digit' });

      const [income, expense] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId: req.user.id, type: 'INCOME', date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId: req.user.id, type: 'EXPENSE', date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ]);

      months.push({ label, income: income._sum.amount || 0, expense: expense._sum.amount || 0 });
    }

    res.json({ data: months });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSummary, getSpendingByCategory, getMonthlyTrend };
