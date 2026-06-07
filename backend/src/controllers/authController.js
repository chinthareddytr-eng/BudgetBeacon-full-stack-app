const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../config/jwt');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, currency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, currency: currency || 'USD' },
      select: { id: true, name: true, email: true, currency: true, createdAt: true },
    });

    // Create default categories for new user
    await prisma.category.createMany({
      data: [
        { name: 'Salary', type: 'INCOME', icon: '💼', color: '#22c55e', userId: user.id },
        { name: 'Freelance', type: 'INCOME', icon: '💻', color: '#3b82f6', userId: user.id },
        { name: 'Food & Dining', type: 'EXPENSE', icon: '🍔', color: '#f97316', userId: user.id },
        { name: 'Transport', type: 'EXPENSE', icon: '🚗', color: '#8b5cf6', userId: user.id },
        { name: 'Shopping', type: 'EXPENSE', icon: '🛍️', color: '#ec4899', userId: user.id },
        { name: 'Bills & Utilities', type: 'EXPENSE', icon: '📄', color: '#ef4444', userId: user.id },
        { name: 'Healthcare', type: 'EXPENSE', icon: '🏥', color: '#14b8a6', userId: user.id },
        { name: 'Entertainment', type: 'EXPENSE', icon: '🎬', color: '#f59e0b', userId: user.id },
      ],
    });

    // Create default checking account
    await prisma.account.create({
      data: { name: 'Main Checking', type: 'CHECKING', userId: user.id },
    });

    const token = generateToken(user.id);
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, currency } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, currency },
      select: { id: true, name: true, email: true, currency: true },
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = { register, login, getMe, updateProfile };
