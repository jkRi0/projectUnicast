import { Link, NavLink } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';

const navLinks = [
  { to: '/', label: 'Home', private: false },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuthContext();

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__branding">
          <Link to="/" className="layout__logo">
            <span className="layout__logo-mark" aria-hidden="true">
              App
            </span>
            Name
          </Link>
          <p className="layout__tagline">Your platform</p>
        </div>
        <nav className="layout__nav">
          {navLinks.map((link) => {
            if (link.private && !user) return null;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `layout__nav-link ${isActive ? 'layout__nav-link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="layout__auth">
          {user ? (
            <>
              <span className="layout__user">{user.username}</span>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn--ghost">
              Log in
            </Link>
          )}
        </div>
      </header>
      <main className="layout__main">{children}</main>
      <footer className="layout__footer">
        <p>&copy; {new Date().getFullYear()} App Name. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
