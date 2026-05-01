import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Affiliations from './pages/Affiliations';
import Notes from './pages/Notes';
import CustomerDetail from './pages/CustomerDetail';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <span className="brand-icon">🏢</span>
              <span className="brand-text">CRM Platform</span>
            </div>
            <div className="nav-menu">
              <NavLink to="/" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} end>
                📊 Dashboard
              </NavLink>
              <NavLink to="/customers" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                👥 Customers
              </NavLink>
              <NavLink to="/affiliations" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                🔗 Affiliations
              </NavLink>
              <NavLink to="/notes" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                📝 Notes
              </NavLink>
            </div>
            <div className="nav-status">
              <span className="status-dot"></span>
              <span>System Online</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/affiliations" element={<Affiliations />} />
            <Route path="/notes" element={<Notes />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>&copy; 2024 CRM Platform. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;