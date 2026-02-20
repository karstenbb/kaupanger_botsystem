import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import {
  IconHome,
  IconUsers,
  IconDocument,
  IconTrophy,
  IconSettings,
  IconLogout,
  IconFootball,
  IconWallet,
} from './Icons';

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { to: '/', icon: <IconHome />, label: 'Oversikt', shortLabel: 'Heim' },
    { to: '/mine-boter', icon: <IconWallet />, label: 'Mine bøter', shortLabel: 'Mine' },
    { to: '/spelarar', icon: <IconUsers />, label: 'Spelarar', shortLabel: 'Spelarar' },
    { to: '/boter', icon: <IconDocument />, label: 'Bøter', shortLabel: 'Bøter' },
    { to: '/toppliste', icon: <IconTrophy />, label: 'Toppliste', shortLabel: 'Topp' },
    ...(isAdmin
      ? [{ to: '/admin', icon: <IconSettings />, label: 'Admin', shortLabel: 'Admin' }]
      : []),
  ];

  return (
    <div className="app-layout">
      {/* ── Desktop Sidebar ──────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <IconFootball />
          </div>
          <div>
            <h1>Kaupanger</h1>
            <span>Botsystem</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <Avatar name={user?.username ?? '?'} size="sm" />
          <div className="sidebar-user-info">
            <p>{user?.username}</p>
            <span>{isAdmin ? 'Administrator' : 'Spelar'}</span>
          </div>
          <button className="logout-btn" onClick={logout} title="Logg ut">
            <IconLogout />
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────── */}
      <div className="main-content">
        {/* Mobile header */}
        <header className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconFootball />
            <div>
              <h1>Kaupanger</h1>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Botsystem</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user?.username}</span>
            <button className="logout-btn" onClick={logout}>
              <IconLogout />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>

        {/* Mobile bottom nav */}
        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `bottom-nav-link${isActive ? ' active' : ''}`
                }
              >
                {item.icon}
                <span>{item.shortLabel}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
