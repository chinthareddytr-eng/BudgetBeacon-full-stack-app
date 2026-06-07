const prisma = require('../config/db');

const getBudgets = async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.user.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ budgets });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createBudget = async (req, res) => {
  try {
    const { name, amount, period, startDate, endDate, categoryId } = req.body;
    if (!name || !amount || !period || !startDate || !endDate) {
      return res.status(400).json({ message: 'All fields required' });
    }
    const budget = await prisma.budget.create({
      data: {
        name, amount: parseFloat(amount), period,
        startDate: new Date(startDate), endDate: new Date(endDate),
        userId: req.user.id, categoryId: categoryId || null,
      },
      include: { category: true },
    });
    res.status(201).json({ budget });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating budget' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const budget = await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    const updated = await prisma.budget.update({ where: { id: req.params.id }, data: req.body, include: { category: true } });
    res.json({ budget: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await prisma.budget.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    await prisma.budget.delete({ where: { id: req.params.id } });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
