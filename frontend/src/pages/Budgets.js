import React, { useEffect, useState } from 'react';
import { getBudgets, createBudget, deleteBudget, getCategories } from '../utils/api';
import toast from 'react-hot-toast';

const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', period: 'MONTHLY', startDate: new Date().toISOString().split('T')[0], endDate: '', categoryId: '' });

  const load = async () => {
    try {
      const [b, c] = await Promise.all([getBudgets(), getCategories({ type: 'EXPENSE' })]);
      setBudgets(b.data.budgets);
      setCategories(c.data.categories);
    } catch { toast.error('Failed to load budgets'); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBudget(form);
      toast.success('Budget created!');
      setShowForm(false);
      setForm({ name: '', amount: '', period: 'MONTHLY', startDate: new Date().toISOString().split('T')[0], endDate: '', categoryId: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try { await deleteBudget(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Budgets</h1>
        <button style={styles.btn} onClick={() => setShowForm(!showForm)}>+ New Budget</button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Create Budget</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <input style={styles.input} placeholder="Budget Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input style={styles.input} type="number" placeholder="Amount ($)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              <select style={styles.input} value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div style={styles.row}>
              <select style={styles.input} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <input style={styles.input} type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
              <input style={styles.input} type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={styles.btn} type="submit">Create</button>
              <button style={styles.btnOutline} type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {budgets.length === 0 ? (
          <p style={{ color: '#64748b' }}>No budgets yet. Create one to start tracking spending!</p>
        ) : budgets.map(b => {
          const pct = Math.min((b.spent / b.amount) * 100, 100);
          const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#22c55e';
          const remaining = b.amount - b.spent;
          return (
            <div key={b.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.cardName}>{b.name}</div>
                  <div style={styles.cardSub}>{b.period} · {b.category?.name || 'All categories'}</div>
                </div>
                <button style={styles.deleteBtn} onClick={() => handleDelete(b.id)}>🗑</button>
              </div>
              <div style={styles.amounts}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Spent: <strong style={{ color: '#f1f5f9' }}>{fmt(b.spent)}</strong></span>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Limit: <strong style={{ color: '#f1f5f9' }}>{fmt(b.amount)}</strong></span>
              </div>
              <div style={styles.barBg}>
                <div style={{ width: `${pct}%`, background: color, height: '10px', borderRadius: '100px', transition: 'width 0.4s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ color, fontSize: '0.8rem', fontWeight: '600' }}>{pct.toFixed(0)}% used</span>
                <span style={{ color: remaining >= 0 ? '#4ade80' : '#f87171', fontSize: '0.8rem' }}>
                  {remaining >= 0 ? `${fmt(remaining)} left` : `${fmt(Math.abs(remaining))} over`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { color: '#f1f5f9', fontSize: '1.75rem', fontWeight: '700' },
  btn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.625rem 1.25rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  btnOutline: { background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '0.625rem 1.25rem', cursor: 'pointer', fontSize: '0.9rem' },
  formCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  formTitle: { color: '#f1f5f9', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  input: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.625rem 0.875rem', color: '#f1f5f9', fontSize: '0.875rem', flex: 1, minWidth: '150px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  cardName: { color: '#f1f5f9', fontWeight: '600', fontSize: '1rem', marginBottom: '4px' },
  cardSub: { color: '#64748b', fontSize: '0.8rem' },
  amounts: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' },
  barBg: { background: '#0f172a', borderRadius: '100px', height: '10px' },
  deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 },
};
