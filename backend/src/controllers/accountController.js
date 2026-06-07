const prisma = require('../config/db');

// ACCOUNTS
const getAccounts = async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ accounts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createAccount = async (req, res) => {
  try {
    const { name, type, balance, currency } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'Name and type required' });
    const account = await prisma.account.create({
      data: { name, type, balance: parseFloat(balance) || 0, currency: currency || 'USD', userId: req.user.id },
    });
    res.status(201).json({ account });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const account = await prisma.account.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    await prisma.account.delete({ where: { id: req.params.id } });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// CATEGORIES
const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { userId: req.user.id };
    if (type) where.type = type;
    const categories = await prisma.category.findMany({ where, orderBy: { name: 'asc' } });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'Name and type required' });
    const category = await prisma.category.create({
      data: { name, type, icon, color, userId: req.user.id },
    });
    res.status(201).json({ category });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ALERTS
const getAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.id, triggered: true },
      include: { budget: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAccounts, createAccount, deleteAccount, getCategories, createCategory, getAlerts };
