import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const TeacherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statusMap, setStatusMap] = useState({});
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const [dashRes, studentsRes] = await Promise.all([api.get("/dashboard/teacher"), api.get("/attendance/students")]);
    setStats(dashRes.data);
    setStudents(studentsRes.data);

    const map = {};
    studentsRes.data.forEach((student) => {
      map[student._id] = "Present";
    });
    setStatusMap(map);
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitAttendance = async () => {
    const records = students.map((student) => ({
      studentId: student._id,
      status: statusMap[student._id] || "Present"
    }));
    await api.post("/attendance/mark", { date, records });
    setMessage("Attendance saved successfully");
    const updated = await api.get("/dashboard/teacher");
    setStats(updated.data);
  };

  const summary = useMemo(() => {
    const values = Object.values(statusMap);
    return {
      Present: values.filter((s) => s === "Present").length,
      Absent: values.filter((s) => s === "Absent").length,
      Late: values.filter((s) => s === "Late").length
    };
  }, [statusMap]);

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h2>Teacher Dashboard</h2>
        {stats && (
          <div className="stat-grid">
            <div className="stat-tile">
              <span>Students</span>
              <strong>{stats.students}</strong>
            </div>
            <div className="stat-tile">
              <span>Records Marked</span>
              <strong>{stats.recordsMarked}</strong>
            </div>
            <div className="stat-tile">
              <span>Today Plan</span>
              <strong>
                P:{summary.Present} A:{summary.Absent} L:{summary.Late}
              </strong>
            </div>
          </div>
        )}
      </section>

      <section className="card wide">
        <h3>Mark Attendance</h3>
        <div className="toolbar">
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <button className="primary-btn" type="button" onClick={submitAttendance}>
            Save Attendance
          </button>
        </div>
        {message && <div className="success">{message}</div>}
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Code</th>
              <th>Class</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.studentCode || "-"}</td>
                <td>{student.className || "-"}</td>
                <td>
                  <select
                    value={statusMap[student._id] || "Present"}
                    onChange={(e) => setStatusMap((prev) => ({ ...prev, [student._id]: e.target.value }))}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card wide">
        <h3>Recent Entries</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recent?.map((entry) => (
              <tr key={entry._id}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{entry.student?.name}</td>
                <td>{entry.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default TeacherDashboard;
