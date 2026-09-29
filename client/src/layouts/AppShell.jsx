import { useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const navItems = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/pantry', label: 'My pantry' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/ai-recipe', label: 'Chef AI' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  function signOut() {
    logout();
    navigate('/');
  }
  return <div className="app-frame">
    <header className="topbar">
      <div className="topbar-inner">
        <Logo />
        <button className="mobile-menu button button-quiet" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <nav className={`main-nav${menuOpen ? ' nav-open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{item.label}</NavLink>)}
        </nav>
        <div className="topbar-actions">
          <span className="nav-divider" />
          <button className="icon-button alert-button" aria-label="Expiry alerts" title="Expiry alerts"><Bell size={18} /><span /></button>
          <div className="account-wrap">
            <button className="account-button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}><span className="avatar">{user?.name?.[0]?.toUpperCase() || 'F'}</span><span className="account-name">{user?.name?.split(' ')[0]}</span><ChevronDown size={15} /></button>
            {accountOpen && <div className="account-menu"><NavLink to="/profile" onClick={() => setAccountOpen(false)}>Profile & settings</NavLink><button onClick={signOut}><LogOut size={15} /> Sign out</button></div>}
          </div>
        </div>
      </div>
    </header>
    <main className="app-main"><Outlet /></main>
    <footer className="app-footer"><span>FoodSentry</span><span>Less waste, more good food.</span></footer>
  </div>;
}
