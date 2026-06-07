import React, { useEffect, useState } from 'react';
import { getAccounts, createAccount, deleteAccount } from '../utils/api';
import toast from 'react-hot-toast';

const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const typeIcon = { CHECKING: '🏦', SAVINGS: '💰', CREDIT: '💳', INVESTMENT: '📈', CASH: '💵' };

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'CHECKING', balance: '0', currency: 'USD' });

  const load = async () => {
    try { const { data } = await getAccounts(); setAccounts(data.accounts); }
    catch { toast.error('Failed to load accounts'); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await createAccount(form); toast.success('Account created!'); setShowForm(false); setForm({ name: '', type: 'CHECKING', balance: '0', currency: 'USD' }); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    try { await deleteAccount(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Accounts</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Balance: <strong style={{ color: '#a5b4fc' }}>{fmt(totalBalance)}</strong></p>
        </div>
        <button style={styles.btn} onClick={() => setShowForm(!showForm)}>+ Add Account</button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>New Account</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row}>
              <input style={styles.input} placeholder="Account Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <select style={styles.input} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
                <option value="CREDIT">Credit</option>
                <option value="INVESTMENT">Investment</option>
                <option value="CASH">Cash</option>
              </select>
              <input style={styles.input} type="number" placeholder="Opening Balance" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={styles.btn} type="submit">Create</button>
              <button style={styles.btnOutline} type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {accounts.map(a => (
          <div key={a.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.iconBox}>{typeIcon[a.type] || '🏦'}</div>
              <button style={styles.deleteBtn} onClick={() => handleDelete(a.id)}>🗑</button>
            </div>
            <div style={styles.cardName}>{a.name}</div>
            <div style={styles.cardType}>{a.type}</div>
            <div style={styles.balance}>{fmt(a.balance)}</div>
            <div style={styles.currency}>{a.currency}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { color: '#f1f5f9', fontSize: '1.75rem', fontWeight: '700', marginBottom: '4px' },
  btn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.625rem 1.25rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  btnOutline: { background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '0.625rem 1.25rem', cursor: 'pointer', fontSize: '0.9rem' },
  formCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  formTitle: { color: '#f1f5f9', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  input: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.625rem 0.875rem', color: '#f1f5f9', fontSize: '0.875rem', flex: 1, minWidth: '150px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' },
  iconBox: { fontSize: '2rem' },
  cardName: { color: '#f1f5f9', fontWeight: '600', fontSize: '1rem', marginBottom: '4px' },
  cardType: { color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' },
  balance: { color: '#a5b4fc', fontSize: '1.5rem', fontWeight: '700' },
  currency: { color: '#64748b', fontSize: '0.75rem', marginTop: '4px' },
  deleteBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 },
};
