import React, { useEffect, useState } from 'react';
import { getTransactions, createTransaction, deleteTransaction, getAccounts, getCategories } from '../utils/api';
import toast from 'react-hot-toast';

const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ amount: '', type: 'EXPENSE', description: '', accountId: '', categoryId: '', date: new Date().toISOString().split('T')[0] });

  const load = async () => {
    try {
      const [t, a, c] = await Promise.all([getTransactions(), getAccounts(), getCategories()]);
      setTransactions(t.data.transactions);
      setAccounts(a.data.accounts);
      setCategories(c.data.categories);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTransaction(form);
      toast.success('Transaction added!');
      setShowForm(false);
      setForm({ amount: '', type: 'EXPENSE', description: '', accountId: '', categoryId: '', date: new Date().toISOString().split('T')[0] });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await deleteTransaction(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = transactions.filter(t =>
    !filter || t.description?.toLowerCase().includes(filter.toLowerCase()) || t.category?.name?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div style={{ color: '#94a3b8' }}>Loading...</div>;

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Transactions</h1>
        <button style={styles.btn} onClick={() => setShowForm(!showForm)}>+ Add Transaction</button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>New Transaction</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <select style={styles.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
              <input style={styles.input} type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              <input style={styles.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div style={styles.formRow}>
              <input style={styles.input} type="text" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <select style={styles.input} value={form.accountId} onChange={e => setForm({ ...form, accountId: e.target.value })} required>
                <option value="">Select Account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select style={styles.input} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Select Category</option>
                {categories.filter(c => c.type === form.type).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={styles.btn} type="submit">Save</button>
              <button style={styles.btnOutline} type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.filterRow}>
        <input style={{ ...styles.input, maxWidth: '300px' }} placeholder="🔍 Search transactions..." value={filter} onChange={e => setFilter(e.target.value)} />
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{filtered.length} transactions</span>
      </div>

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span>Description</span><span>Category</span><span>Account</span><span>Date</span><span>Amount</span><span></span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ color: '#64748b', padding: '2rem', textAlign: 'center' }}>No transactions found</div>
        ) : (
          filtered.map(t => (
            <div key={t.id} style={styles.tableRow}>
              <span style={{ color: '#f1f5f9' }}>{t.description || '—'}</span>
              <span style={{ color: '#94a3b8' }}>{t.category?.icon} {t.category?.name || 'Uncategorized'}</span>
              <span style={{ color: '#94a3b8' }}>{t.account?.name}</span>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(t.date).toLocaleDateString()}</span>
              <span style={{ color: t.type === 'INCOME' ? '#4ade80' : '#f87171', fontWeight: '600' }}>
                {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
              </span>
              <button style={styles.deleteBtn} onClick={() => handleDelete(t.id)}>🗑</button>
            </div>
          ))
        )}
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
  formRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  input: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.625rem 0.875rem', color: '#f1f5f9', fontSize: '0.875rem', flex: 1, minWidth: '150px' },
  filterRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
  table: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 0.5fr', padding: '0.875rem 1.25rem', borderBottom: '1px solid #334155', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 0.5fr', padding: '0.875rem 1.25rem', borderBottom: '1px solid #1e293b', alignItems: 'center', fontSize: '0.875rem' },
  deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 },
};
