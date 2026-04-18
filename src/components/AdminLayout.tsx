import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { Users, Bell, Settings, LogOut, UserPlus } from 'lucide-react';
import { getLoggedInPractitionerId, logoutPractitioner } from '../hooks/usePractitioner';

export default function AdminLayout() {
  const practitionerId = getLoggedInPractitionerId();

  if (!practitionerId) {
    return <Navigate to="/admin/login" replace />;
  }

  function handleLogout() {
    logoutPractitioner();
    window.location.href = '/admin/login';
  }

  return (
    <div className="app-layout admin-layout">
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">B</div>
          <div>
            <h1>Buddy Admin</h1>
            <span className="brand-tagline">Practitioner Portal</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
        </button>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="app-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Clients</span>
        </NavLink>
        <NavLink to="/admin/alerts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bell size={20} />
          <span>Alerts</span>
        </NavLink>
        <NavLink to="/admin/add-client" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UserPlus size={20} />
          <span>Add Client</span>
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
}
