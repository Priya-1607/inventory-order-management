import { NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Layout.css';

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/orders', label: 'Orders' },
];

export default function Layout() {
  const { message } = useApp();

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">InventoryPro</h1>
          <nav className="nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {message && (
        <div className={`toast toast-${message.type}`}>
          {message.text}
        </div>
      )}

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
