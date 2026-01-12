import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Shield, Lock, FileText, Settings as SettingsIcon, LogIn, UserPlus } from "lucide-react";
import { apiPost } from "../api";
import { useSession } from "../session";

export default function Layout() {
  const { sessionToken, username, logout } = useSession();
  const [logoutError, setLogoutError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/vault/credentials", label: "Credentials", icon: <Lock size={16} /> },
    { to: "/vault/documents", label: "Documents", icon: <FileText size={16} /> },
    { to: "/settings", label: "Account", icon: <SettingsIcon size={16} /> },
  ];

  async function handleLogout() {
    setLogoutError(null);
    try {
      if (sessionToken) {
        await apiPost("/logout", {});
      }
    } catch (err) {
      setLogoutError(err.message || "Logout failed");
    } finally {
      logout();
      navigate("/login");
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="icon-box">
            <Shield size={20} />
          </div>
          <div>
            <div className="brand-name">PackageOne Password Manager</div>
          </div>
        </div>
        <div className="header-right">
          {sessionToken ? (
            <>
              <div className="user-chip">
                <span className="dot online" />
                <span>{username || "User"}</span>
              </div>
              <button className="btn ghost" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="nav-links">
              <Link className="nav-link" to="/login">
                <LogIn size={16} />
                Login
              </Link>
              <Link className="nav-link" to="/register">
                <UserPlus size={16} />
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {sessionToken && (
        <nav className="tabs">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`tab ${location.pathname === link.to ? "active" : ""}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {logoutError && <div className="alert warning">{logoutError}</div>}

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
