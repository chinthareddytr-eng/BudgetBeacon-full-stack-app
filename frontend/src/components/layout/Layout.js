import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/transactions', icon: '💳', label: 'Transactions' },
  { path: '/budgets', icon: '🎯', label: 'Budgets' },
  { path: '/accounts', icon: '🏦', label: 'Accounts' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: collapsed ? '70px' : '240px' }}>
        <div style={styles.sidebarTop}>
          <div style={styles.logo} onClick={() => setCollapsed(!collapsed)}>
            <span>💰</span>
            {!collapsed && <span style={styles.logoText}>BudgetBeacon</span>}
          </div>
          <nav style={styles.nav}>
            {navItems.map((item) => (
              <div
                key={item.path}
                style={{
                  ...styles.navItem,
                  background: location.pathname === item.path ? '#312e81' : 'transparent',
                  color: location.pathname === item.path ? '#a5b4fc' : '#94a3b8',
                }}
                onClick={() => navigate(item.path)}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </div>
            ))}
          </nav>
        </div>
        <div style={styles.sidebarBottom}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            {!collapsed && (
              <div>
                <div style={styles.userName}>{user?.name}</div>
                <div style={styles.userEmail}>{user?.email}</div>
              </div>
            )}
          </div>
          <div style={{ ...styles.navItem, color: '#f87171' }} onClick={handleLogout}>
            <span style={styles.navIcon}>🚪</span>
            {!collapsed && <span>Logout</span>}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  shell: { display: 'flex', minHeight: '100vh', background: '#0f172a' },
  sidebar: { background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'width 0.2s', overflow: 'hidden', flexShrink: 0 },
  sidebarTop: { padding: '1.5rem 0' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 1.25rem', marginBottom: '2rem', cursor: 'pointer', fontSize: '1.3rem' },
  logoText: { color: '#6366f1', fontWeight: '700', fontSize: '1.1rem', whiteSpace: 'nowrap' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 0.75rem' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'background 0.15s', whiteSpace: 'nowrap' },
  navIcon: { fontSize: '1.1rem', flexShrink: 0 },
  sidebarBottom: { padding: '1rem 0.75rem', borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '8px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0.75rem 1rem' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 },
  userName: { color: '#f1f5f9', fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap' },
  userEmail: { color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap' },
  main: { flex: 1, overflow: 'auto', padding: '2rem' },
};
