const prisma = require('../config/db');

// @desc    Get all transactions for user
// @route   GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, categoryId, accountId, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (accountId) where.accountId = accountId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true, account: true },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({ transactions, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { amount, type, description, date, accountId, categoryId } = req.body;

    if (!amount || !type || !accountId) {
      return res.status(400).json({ message: 'Amount, type and accountId are required' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        description,
        date: date ? new Date(date) : new Date(),
        userId: req.user.id,
        accountId,
        categoryId: categoryId || null,
      },
      include: { category: true, account: true },
    });

    // Update account balance
    const balanceChange = type === 'INCOME' ? amount : -amount;
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: parseFloat(balanceChange) } },
    });

    // Update budget spent if expense with category
    if (type === 'EXPENSE' && categoryId) {
      const activeBudget = await prisma.budget.findFirst({
        where: {
          userId: req.user.id,
          categoryId,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      if (activeBudget) {
        const updated = await prisma.budget.update({
          where: { id: activeBudget.id },
          data: { spent: { increment: parseFloat(amount) } },
        });

        // Create alert if over 80% or exceeded
        const pct = updated.spent / updated.amount;
        if (pct >= 1) {
          await prisma.alert.create({
            data: {
              type: 'BUDGET_EXCEEDED',
              message: `Budget "${updated.name}" has been exceeded!`,
              triggered: true,
              userId: req.user.id,
              budgetId: updated.id,
            },
          });
        } else if (pct >= 0.8) {
          await prisma.alert.create({
            data: {
              type: 'BUDGET_THRESHOLD',
              message: `Budget "${updated.name}" is at ${Math.round(pct * 100)}% of limit.`,
              threshold: 80,
              triggered: true,
              userId: req.user.id,
              budgetId: updated.id,
            },
          });
        }
      }
    }

    res.status(201).json({ transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating transaction' });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const updated = await prisma.transaction.update({
      where: { id: req.params.id },
      data: req.body,
      include: { category: true, account: true },
    });
    res.json({ transaction: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    await prisma.transaction.delete({ where: { id: req.params.id } });

    // Reverse account balance
    const balanceChange = transaction.type === 'INCOME' ? -transaction.amount : transaction.amount;
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: { balance: { increment: balanceChange } },
    });

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
