import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, ChevronDown, Home, LogOut, Menu, Package, Sparkles, X } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: Home },
  { to: '/pantry', label: 'My pantry', icon: Package },
  { to: '/recipes', label: 'Recipes', icon: BookOpen },
  { to: '/ai-recipe', label: 'Chef AI', icon: Sparkles },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  function signOut() {
    logout();
    navigate('/');
  }
  return <div className="app-frame">
    <header className="topbar">
      <div className="topbar-inner">
        <Logo />
        <button className="mobile-menu button button-quiet" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <div className="topbar-actions">
          <span className="nav-divider" />
          <ThemeToggle />
          <div className="account-wrap">
            <button className="account-button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}><span className="avatar">{user?.name?.[0]?.toUpperCase() || 'F'}</span><span className="account-name">{user?.name?.split(' ')[0]}</span><ChevronDown size={15} /></button>
            <AnimatePresence>{accountOpen && <motion.div className="account-menu" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.14 }}><NavLink to="/profile" onClick={() => setAccountOpen(false)}>Profile & settings</NavLink><button onClick={signOut}><LogOut size={15} /> Sign out</button></motion.div>}</AnimatePresence>
          </div>
        </div>
        <AnimatePresence initial={false}>{menuOpen && <motion.nav className="mobile-nav-panel" aria-label="Mobile navigation" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}>
          {navItems.map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}>{item.label}</NavLink>)}
        </motion.nav>}</AnimatePresence>
      </div>
    </header>
    <div className="app-body"><aside className="app-sidebar" aria-label="Workspace sidebar"><span className="sidebar-section-label">YOUR WORKSPACE</span><nav className="sidebar-nav" aria-label="Main navigation">
      {navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}><Icon size={17} aria-hidden="true" /><span>{label}</span></NavLink>)}
    </nav><div className="sidebar-note"><span className="sidebar-note-mark"><Sparkles size={15} /></span><strong>Good food, used well.</strong><small>A little less waste starts in your kitchen.</small></div></aside>
      <div className="app-content"><main className="app-main"><AnimatePresence mode="wait" initial={false}><motion.div className="route-transition" key={`${location.pathname}${location.search}`} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}><Outlet /></motion.div></AnimatePresence></main><footer className="app-footer"><span>FoodSentry</span><span>Less waste, more good food.</span></footer></div>
    </div>
  </div>;
}
