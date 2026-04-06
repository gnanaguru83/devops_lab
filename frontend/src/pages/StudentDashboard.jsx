import { useEffect, useState } from "react";
import api from "../api/client";

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [dashRes, attendanceRes] = await Promise.all([api.get("/dashboard/student"), api.get("/attendance/me")]);
      setStats(dashRes.data);
      setRecords(attendanceRes.data);
    };
    load();
  }, []);

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h2>Student Dashboard</h2>
        {stats && (
          <div className="stat-grid">
            <div className="stat-tile">
              <span>Total Records</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="stat-tile">
              <span>Present</span>
              <strong>{stats.present}</strong>
            </div>
            <div className="stat-tile">
              <span>Attendance %</span>
              <strong>{stats.attendancePercentage}%</strong>
            </div>
          </div>
        )}
      </section>

      <section className="card wide">
        <h3>Attendance History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Teacher</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {records.map((entry) => (
              <tr key={entry._id}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{entry.status}</td>
                <td>{entry.teacher?.name || "-"}</td>
                <td>{entry.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StudentDashboard;
