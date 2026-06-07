import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getSpendingByCategory, getMonthlyTrend } from '../utils/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', flex: 1, minWidth: '180px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: color || '#f1f5f9' }}>{value}</div>
  </div>
);

const fmt = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, c, t] = await Promise.all([
          getDashboardSummary(),
          getSpendingByCategory(),
          getMonthlyTrend(),
        ]);
        setSummary(s.data);
        setCategoryData(c.data.data);
        setTrendData(t.data.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading dashboard...</div>;

  const doughnutData = {
    labels: categoryData?.map((d) => d.category) || [],
    datasets: [{ data: categoryData?.map((d) => d.amount) || [], backgroundColor: categoryData?.map((d) => d.color || '#6366f1') || [], borderWidth: 0 }],
  };

  const barData = {
    labels: trendData?.map((d) => d.label) || [],
    datasets: [
      { label: 'Income', data: trendData?.map((d) => d.income) || [], backgroundColor: '#22c55e', borderRadius: 6 },
      { label: 'Expenses', data: trendData?.map((d) => d.expense) || [], backgroundColor: '#ef4444', borderRadius: 6 },
    ],
  };

  const chartOptions = { responsive: true, plugins: { legend: { labels: { color: '#94a3b8' } } }, scales: { x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } }, y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } } } };

  return (
    <div>
      <h1 style={styles.pageTitle}>Dashboard</h1>

      {/* Stat Cards */}
      <div style={styles.statsRow}>
        <StatCard icon="💼" label="Total Balance" value={fmt(summary?.totalBalance)} color="#a5b4fc" />
        <StatCard icon="📈" label="Monthly Income" value={fmt(summary?.monthlyIncome)} color="#4ade80" />
        <StatCard icon="📉" label="Monthly Expenses" value={fmt(summary?.monthlyExpenses)} color="#f87171" />
        <StatCard icon="🏦" label="Monthly Savings" value={fmt(summary?.monthlySavings)} color="#34d399" />
      </div>

      {/* Charts */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Spending by Category</h3>
          {categoryData?.length > 0 ? (
            <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16 } } } }} />
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', marginTop: '2rem' }}>No spending data yet</p>
          )}
        </div>
        <div style={{ ...styles.chartCard, flex: 2 }}>
          <h3 style={styles.chartTitle}>6-Month Income vs Expenses</h3>
          <Bar data={barData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Transactions + Budgets */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Recent Transactions</h3>
          {summary?.recentTransactions?.length > 0 ? (
            summary.recentTransactions.map((t) => (
              <div key={t.id} style={styles.txnRow}>
                <div>
                  <div style={{ color: '#f1f5f9', fontSize: '0.9rem' }}>{t.description || t.category?.name || 'Transaction'}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{new Date(t.date).toLocaleDateString()}</div>
                </div>
                <div style={{ color: t.type === 'INCOME' ? '#4ade80' : '#f87171', fontWeight: '600' }}>
                  {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748b' }}>No transactions yet</p>
          )}
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Active Budgets</h3>
          {summary?.budgets?.length > 0 ? (
            summary.budgets.map((b) => {
              const pct = Math.min((b.spent / b.amount) * 100, 100);
              const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#22c55e';
              return (
                <div key={b.id} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#f1f5f9', fontSize: '0.875rem' }}>{b.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{fmt(b.spent)} / {fmt(b.amount)}</span>
                  </div>
                  <div style={{ background: '#0f172a', borderRadius: '100px', height: '8px' }}>
                    <div style={{ width: `${pct}%`, background: color, height: '8px', borderRadius: '100px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: '#64748b' }}>No active budgets</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { color: '#f1f5f9', fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem' },
  statsRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  chartsRow: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  chartCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', flex: 1, minWidth: '280px' },
  chartTitle: { color: '#f1f5f9', fontSize: '1rem', fontWeight: '600', marginBottom: '1.25rem' },
  txnRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #334155' },
};
