import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const location = useLocation();
  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  const isActiveSearchLink = location.pathname.startsWith('/search');

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid d-flex justify-content-between" style={{marginLeft:'2%'}}>
        <NavLink className="navbar-brand" to="#">Stock Search</NavLink>
        <button className="navbar-toggler mr-3" type="button" onClick={handleNavCollapse}
          aria-controls="navbarNav" aria-expanded={!isNavCollapsed} aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse d-lg-flex flex-row-reverse mr-3`} id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              {/* Use isActiveSearchLink to conditionally apply the active class */}
              <NavLink className={`nav-link ${isActiveSearchLink ? 'active' : ''}`} to="/search/home">Search</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" activeClassName="active" to="/watchlist">Watchlist</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" activeClassName="active" to="/portfolio">Portfolio</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
