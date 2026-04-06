import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login, registerInitialAdmin } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");

  useEffect(() => {
    if (user?.role === "admin") navigate("/admin");
    if (user?.role === "teacher") navigate("/teacher");
    if (user?.role === "student") navigate("/student");
  }, [user, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const registerAdmin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerInitialAdmin(adminForm);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create initial admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="center-card">
      <h1>Student Attendance Management</h1>
      <p>{mode === "login" ? "Login as Admin, Teacher, or Student" : "Create initial admin account"}</p>
      <div className="button-row">
        <button className={mode === "login" ? "primary-btn" : "ghost-btn"} type="button" onClick={() => setMode("login")}>
          Login
        </button>
        <button className={mode === "setup" ? "primary-btn" : "ghost-btn"} type="button" onClick={() => setMode("setup")}>
          Initial Admin Setup
        </button>
      </div>
      <form onSubmit={mode === "login" ? onSubmit : registerAdmin} className="form-grid">
        {mode === "setup" && (
          <label>
            Name
            <input
              value={adminForm.name}
              onChange={(e) => setAdminForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            value={mode === "login" ? form.email : adminForm.email}
            onChange={(e) =>
              mode === "login"
                ? setForm((prev) => ({ ...prev, email: e.target.value }))
                : setAdminForm((prev) => ({ ...prev, email: e.target.value }))
            }
            type="email"
            required
          />
        </label>
        <label>
          Password
          <input
            value={mode === "login" ? form.password : adminForm.password}
            onChange={(e) =>
              mode === "login"
                ? setForm((prev) => ({ ...prev, password: e.target.value }))
                : setAdminForm((prev) => ({ ...prev, password: e.target.value }))
            }
            type="password"
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Processing..." : mode === "login" ? "Login" : "Create Admin"}
        </button>
      </form>
    </section>
  );
};

export default LoginPage;
