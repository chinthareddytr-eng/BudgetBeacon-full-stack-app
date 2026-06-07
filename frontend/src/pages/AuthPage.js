import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = isLogin
      ? await login(form.email, form.password)
      : await register(form.name, form.email, form.password);

    if (result.success) {
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>💰 BudgetBeacon</div>
        <h2 style={styles.title}>{isLogin ? 'Sign In' : 'Create Account'}</h2>
        <p style={styles.sub}>{isLogin ? 'Welcome back!' : 'Start tracking your finances'}</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Tharun Chinthareddy"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span style={styles.link} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px' },
  logo: { fontSize: '1.5rem', fontWeight: '700', color: '#6366f1', marginBottom: '1.5rem', textAlign: 'center' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#f1f5f9', marginBottom: '0.25rem', textAlign: 'center' },
  sub: { color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' },
  input: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem 1rem', color: '#f1f5f9', fontSize: '0.95rem', outline: 'none' },
  btn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.875rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  toggle: { color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', marginTop: '1.5rem' },
  link: { color: '#6366f1', cursor: 'pointer', fontWeight: '500' },
};
