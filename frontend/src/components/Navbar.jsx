import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const links = [];
  if (user.role === "admin") links.push({ to: "/admin", label: "Admin Dashboard" });
  if (user.role === "teacher") links.push({ to: "/teacher", label: "Teacher Dashboard" });
  if (user.role === "student") links.push({ to: "/student", label: "My Dashboard" });
  if (["admin", "teacher"].includes(user.role)) links.push({ to: "/reports", label: "Reports" });

  const toggleTheme = () => document.body.classList.toggle("dark");

  return (
    <header className="topbar">
      <div className="brand">AttendanceMS</div>
      <nav className="nav-links">
        {links.map((link) => (
          <Link key={link.to} className={location.pathname === link.to ? "active" : ""} to={link.to}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="topbar-actions">
        <button className="ghost-btn" onClick={toggleTheme} type="button">
          Theme
        </button>
        <button className="primary-btn small" onClick={logout} type="button">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
