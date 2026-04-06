import { useEffect, useMemo, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import api from "../api/client";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "student",
  studentCode: "",
  className: ""
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    const [statsRes, studentsRes, teachersRes] = await Promise.all([
      api.get("/dashboard/admin"),
      api.get("/admin/users/student"),
      api.get("/admin/users/teacher")
    ]);
    setStats(statsRes.data);
    setStudents(studentsRes.data);
    setTeachers(teachersRes.data);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      if (editId) {
        await api.put(`/admin/users/${editId}`, form);
        setMessage("User updated successfully");
      } else {
        await api.post("/admin/users", form);
        setMessage("User created successfully");
      }
      resetForm();
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user");
    }
  };

  const startEdit = (record) => {
    setEditId(record._id);
    setForm({
      name: record.name || "",
      email: record.email || "",
      password: "",
      role: record.role || "student",
      studentCode: record.studentCode || "",
      className: record.className || ""
    });
  };

  const deleteUser = async (id) => {
    await api.delete(`/admin/users/${id}`);
    await loadDashboard();
  };

  const pieData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.statusBreakdown).map(([name, value]) => ({ name, value }));
  }, [stats]);

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h2>Admin Dashboard</h2>
        {stats && (
          <div className="stat-grid">
            <div className="stat-tile">
              <span>Total Students</span>
              <strong>{stats.students}</strong>
            </div>
            <div className="stat-tile">
              <span>Total Teachers</span>
              <strong>{stats.teachers}</strong>
            </div>
            <div className="stat-tile">
              <span>Today's Attendance</span>
              <strong>{stats.todayAttendance}</strong>
            </div>
          </div>
        )}
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                <Cell fill="#0891b2" />
                <Cell fill="#f97316" />
                <Cell fill="#16a34a" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <h3>{editId ? "Edit User" : "Add User"}</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editId ? "Leave empty to keep old password" : "Minimum 6 characters"}
              required={!editId}
            />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={Boolean(editId)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </label>
          <label>
            Class
            <input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
          </label>
          {form.role === "student" && (
            <label>
              Student Code
              <input value={form.studentCode} onChange={(e) => setForm({ ...form, studentCode: e.target.value })} />
            </label>
          )}
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <div className="button-row">
            <button className="primary-btn" type="submit">
              {editId ? "Update User" : "Create User"}
            </button>
            {editId && (
              <button className="ghost-btn" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="card wide">
        <h3>Students</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Class</th>
              <th>Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.className || "-"}</td>
                <td>{student.studentCode || "-"}</td>
                <td>
                  <button className="link-btn" onClick={() => startEdit(student)} type="button">
                    Edit
                  </button>
                  <button className="link-btn danger" onClick={() => deleteUser(student._id)} type="button">
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card wide">
        <h3>Teachers</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Class</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher._id}>
                <td>{teacher.name}</td>
                <td>{teacher.email}</td>
                <td>{teacher.className || "-"}</td>
                <td>
                  <button className="link-btn" onClick={() => startEdit(teacher)} type="button">
                    Edit
                  </button>
                  <button className="link-btn danger" onClick={() => deleteUser(teacher._id)} type="button">
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;
