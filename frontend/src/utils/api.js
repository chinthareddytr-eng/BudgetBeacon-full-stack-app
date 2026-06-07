import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Dashboard
export const getDashboardSummary = () => API.get('/dashboard/summary');
export const getSpendingByCategory = (params) => API.get('/dashboard/spending-by-category', { params });
export const getMonthlyTrend = () => API.get('/dashboard/monthly-trend');

// Transactions
export const getTransactions = (params) => API.get('/transactions', { params });
export const createTransaction = (data) => API.post('/transactions', data);
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

// Budgets
export const getBudgets = () => API.get('/budgets');
export const createBudget = (data) => API.post('/budgets', data);
export const updateBudget = (id, data) => API.put(`/budgets/${id}`, data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);

// Accounts
export const getAccounts = () => API.get('/accounts');
export const createAccount = (data) => API.post('/accounts', data);
export const deleteAccount = (id) => API.delete(`/accounts/${id}`);

// Categories
export const getCategories = (params) => API.get('/categories', { params });

// Alerts
export const getAlerts = () => API.get('/alerts');

export default API;
